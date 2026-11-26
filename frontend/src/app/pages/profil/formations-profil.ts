import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PARCOURS_MIAGE, UNIVERSITES_MIAGE } from '../../modeles/referentiel-miage';
import { Formation } from '../../modeles/utilisateur';
import { messageErreur } from '../../outils/format';
import { UtilisateurService } from '../../services/utilisateur.service';

@Component({
  selector: 'app-formations-profil',
  imports: [ReactiveFormsModule],
  templateUrl: './formations-profil.html',
  styleUrl: './parcours-profil.scss',
})
export class FormationsProfil implements OnInit {
  @Input({ required: true }) userId!: number;

  private fb = inject(FormBuilder);
  private utilisateurService = inject(UtilisateurService);

  universites = UNIVERSITES_MIAGE;
  formations = signal<Formation[]>([]);
  chargement = signal(true);
  erreurChargement = signal(false);
  formulaireOuvert = signal(false);
  envoiEnCours = signal(false);
  erreurAjout = signal('');
  formationAjoutee = signal(false);

  formationsTriees = computed(() =>
    [...this.formations()].sort((a, b) => b.anneeDebut - a.anneeDebut),
  );

  formulaire = this.fb.nonNullable.group({
    etablissementId: this.fb.control<number | null>(null, Validators.required),
    parcoursId: this.fb.control<number | null>(null),
    anneeDebut: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.pattern(/^[1-9]\d{3}$/),
    ]),
    anneeFin: this.fb.control<number | null>(null, Validators.pattern(/^[1-9]\d{3}$/)),
    commentaire: [''],
  });

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement.set(true);
    this.erreurChargement.set(false);
    this.utilisateurService.formations(this.userId).subscribe({
      next: (formations) => {
        this.formations.set(formations);
        this.chargement.set(false);
      },
      error: () => {
        this.erreurChargement.set(true);
        this.chargement.set(false);
      },
    });
  }

  parcoursProposes() {
    const universite = this.formulaire.controls.etablissementId.value;
    return PARCOURS_MIAGE.filter((parcours) => parcours.etablissementId === universite);
  }

  ouvrirFormulaire(): void {
    this.formationAjoutee.set(false);
    this.formulaireOuvert.set(true);
  }

  fermerFormulaire(): void {
    this.formulaire.reset();
    this.erreurAjout.set('');
    this.formulaireOuvert.set(false);
  }

  ajouter(): void {
    if (this.envoiEnCours()) return;

    this.erreurAjout.set('');
    const { etablissementId, parcoursId, anneeDebut, anneeFin, commentaire } = this.formulaire.getRawValue();
    if (this.formulaire.invalid || etablissementId === null || anneeDebut === null) {
      this.formulaire.markAllAsTouched();
      return;
    }
    if (anneeFin !== null && anneeFin < anneeDebut) {
      this.erreurAjout.set("L’année de fin doit être égale ou postérieure à l’année de début.");
      return;
    }

    this.envoiEnCours.set(true);
    this.utilisateurService.ajouterFormation(this.userId, {
      etablissementId,
      parcoursId,
      anneeDebut,
      anneeFin,
      commentaire: commentaire.trim() || null,
    }).subscribe({
      next: (formation) => {
        this.formations.update((formations) => [...formations, formation]);
        this.envoiEnCours.set(false);
        this.fermerFormulaire();
        this.formationAjoutee.set(true);
      },
      error: (erreur) => {
        this.erreurAjout.set(messageErreur(erreur, 'La formation n’a pas pu être ajoutée.'));
        this.envoiEnCours.set(false);
      },
    });
  }
}
