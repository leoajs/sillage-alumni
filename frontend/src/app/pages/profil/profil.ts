import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Avatar } from '../../composants/avatar/avatar';
import { Experience, Utilisateur } from '../../modeles/utilisateur';
import { initiales, messageErreur, teinteAvatar } from '../../outils/format';
import { SessionService } from '../../services/session.service';
import { UtilisateurService } from '../../services/utilisateur.service';
import { FormationsProfil } from './formations-profil';

@Component({
  selector: 'app-profil',
  imports: [Avatar, ReactiveFormsModule, FormationsProfil],
  templateUrl: './profil.html',
  styleUrls: ['./profil.scss', './parcours-profil.scss'],
})
export class Profil implements OnInit {
  private fb = inject(FormBuilder);
  private session = inject(SessionService);
  private utilisateurService = inject(UtilisateurService);

  profil = signal<Utilisateur | null>(null);
  erreur = signal(false);
  experiences = signal<Experience[]>([]);
  chargementExperiences = signal(true);
  erreurExperiences = signal(false);
  formulaireOuvert = signal(false);
  envoiEnCours = signal(false);
  erreurAjout = signal('');
  experienceAjoutee = signal(false);

  experiencesTriees = computed(() =>
    [...this.experiences()].sort((a, b) => b.anneeDebut - a.anneeDebut),
  );

  formulaire = this.fb.nonNullable.group({
    poste: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(150)]],
    entreprise: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(150)]],
    anneeDebut: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.pattern(/^[1-9]\d{3}$/),
    ]),
    anneeFin: this.fb.control<number | null>(null, Validators.pattern(/^[1-9]\d{3}$/)),
    commentaire: [''],
  });

  initiales = initiales;
  teinteAvatar = teinteAvatar;

  ngOnInit(): void {
    const utilisateur = this.session.utilisateur();
    if (!utilisateur) {
      this.erreur.set(true);
      return;
    }

    this.utilisateurService.consulter(utilisateur.userId).subscribe({
      next: (profil) => this.profil.set(profil),
      error: () => this.erreur.set(true),
    });
    this.chargerExperiences(utilisateur.userId);
  }

  chargerExperiences(userId: number): void {
    this.chargementExperiences.set(true);
    this.erreurExperiences.set(false);
    this.utilisateurService.experiences(userId).subscribe({
      next: (experiences) => {
        this.experiences.set(experiences);
        this.chargementExperiences.set(false);
      },
      error: () => {
        this.erreurExperiences.set(true);
        this.chargementExperiences.set(false);
      },
    });
  }

  ouvrirFormulaire(): void {
    this.experienceAjoutee.set(false);
    this.formulaireOuvert.set(true);
  }

  fermerFormulaire(): void {
    this.formulaire.reset();
    this.erreurAjout.set('');
    this.formulaireOuvert.set(false);
  }

  champInvalide(nom: 'poste' | 'entreprise' | 'anneeDebut' | 'anneeFin'): boolean {
    const champ = this.formulaire.controls[nom];
    return champ.touched && champ.invalid;
  }

  ajouterExperience(): void {
    const utilisateur = this.session.utilisateur();
    if (!utilisateur || this.envoiEnCours()) return;

    this.erreurAjout.set('');
    const { poste, entreprise, anneeDebut, anneeFin, commentaire } = this.formulaire.getRawValue();
    if (this.formulaire.invalid || anneeDebut === null) {
      this.formulaire.markAllAsTouched();
      return;
    }
    if (anneeFin !== null && anneeFin < anneeDebut) {
      this.erreurAjout.set("L’année de fin doit être égale ou postérieure à l’année de début.");
      return;
    }

    this.envoiEnCours.set(true);
    this.utilisateurService.ajouterExperience(utilisateur.userId, {
      poste: poste.trim(),
      entreprise: entreprise.trim(),
      anneeDebut,
      anneeFin,
      commentaire: commentaire.trim() || null,
    }).subscribe({
      next: (experience) => {
        this.experiences.update((experiences) => [...experiences, experience]);
        this.envoiEnCours.set(false);
        this.fermerFormulaire();
        this.experienceAjoutee.set(true);
      },
      error: (erreur) => {
        this.erreurAjout.set(messageErreur(erreur, "L’expérience n’a pas pu être ajoutée."));
        this.envoiEnCours.set(false);
      },
    });
  }
}
