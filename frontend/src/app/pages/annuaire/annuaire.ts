import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { Avatar } from '../../composants/avatar/avatar';
import { Experience, Formation, Utilisateur } from '../../modeles/utilisateur';
import { initiales, messageErreur, teinteAvatar } from '../../outils/format';
import { SessionService } from '../../services/session.service';
import { UtilisateurService } from '../../services/utilisateur.service';

@Component({
  selector: 'app-annuaire',
  imports: [FormsModule, Avatar],
  templateUrl: './annuaire.html',
  styleUrl: './annuaire.scss',
})
export class Annuaire implements OnInit, OnDestroy {
  private utilisateurService = inject(UtilisateurService);
  private session = inject(SessionService);
  private requeteProfil?: Subscription;
  private requeteMembres?: Subscription;

  membres = signal<Utilisateur[]>([]);
  recherche = signal('');
  villeChoisie = signal('');
  chargement = signal(true);
  erreur = signal('');

  selection = signal<Utilisateur | null>(null);
  experiences = signal<Experience[]>([]);
  formations = signal<Formation[]>([]);
  chargementProfil = signal(false);

  initiales = initiales;
  teinteAvatar = teinteAvatar;

  // Les villes proposées dans le filtre, sans doublon et triées
  villes = computed(() => {
    const toutes = this.membres()
      .map((membre) => membre.ville)
      .filter((ville): ville is string => !!ville);
    return [...new Set(toutes)].sort();
  });

  // Recherche par nom ou ville, faite dans le navigateur
  membresAffiches = computed(() => {
    const texte = this.recherche().trim().toLowerCase();
    const ville = this.villeChoisie();
    return this.membres().filter((membre) => {
      const nomComplet = `${membre.prenom} ${membre.nom} ${membre.ville ?? ''}`.toLowerCase();
      return (!texte || nomComplet.includes(texte)) && (!ville || membre.ville === ville);
    });
  });

  // L'expérience sans date de fin est le poste actuel
  posteActuel = computed(() => this.experiences().find((experience) => experience.anneeFin === null) ?? null);

  ngOnInit(): void {
    // GET /users
    this.requeteMembres = this.utilisateurService.lister().subscribe({
      next: (liste) => {
        this.membres.set(liste);
        this.chargement.set(false);
        if (liste.length > 0) {
          this.choisir(liste[0]);
        }
      },
      error: (erreur) => {
        this.erreur.set(messageErreur(erreur, "Impossible de charger l'annuaire."));
        this.chargement.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.requeteMembres?.unsubscribe();
    this.requeteProfil?.unsubscribe();
  }

  // GET /api/users/{id}/experiences et /formations pour le profil sélectionné
  choisir(membre: Utilisateur): void {
    // Une réponse tardive ne doit pas remplir la fiche du membre suivant.
    this.requeteProfil?.unsubscribe();
    this.selection.set(membre);
    this.experiences.set([]);
    this.formations.set([]);
    this.chargementProfil.set(true);
    this.requeteProfil = forkJoin({
      experiences: this.utilisateurService.experiences(membre.id),
      formations: this.utilisateurService.formations(membre.id),
    }).subscribe({
      next: ({ experiences, formations }) => {
        this.experiences.set(experiences);
        this.formations.set(formations);
        this.chargementProfil.set(false);
      },
      error: () => {
        this.chargementProfil.set(false);
      },
    });
  }

  estMoi(membre: Utilisateur): boolean {
    return membre.id === this.session.utilisateur()?.userId;
  }

  libelleRole(membre: Utilisateur): string {
    return membre.role === 'ORGANISATEUR' ? 'Organisateur' : membre.role === 'ADMIN' ? 'Admin' : 'Membre';
  }
}
