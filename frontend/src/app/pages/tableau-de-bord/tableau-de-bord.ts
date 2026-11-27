import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { Avatar } from '../../composants/avatar/avatar';
import { CarteEvenement } from '../../composants/carte-evenement/carte-evenement';
import { CarteFrance, VilleMembres } from '../../composants/carte-france/carte-france';
import { Evenement, MonInscription } from '../../modeles/evenement';
import { Sujet } from '../../modeles/forum';
import { Utilisateur } from '../../modeles/utilisateur';
import { ilYa, initiales, messageErreur, normaliserVille, teinteAvatar } from '../../outils/format';
import { EvenementService } from '../../services/evenement.service';
import { ForumService } from '../../services/forum.service';
import { SessionService } from '../../services/session.service';
import { UtilisateurService } from '../../services/utilisateur.service';

@Component({
  selector: 'app-tableau-de-bord',
  imports: [RouterLink, Avatar, CarteFrance, CarteEvenement],
  templateUrl: './tableau-de-bord.html',
  styleUrl: './tableau-de-bord.scss',
})
export class TableauDeBord implements OnInit, OnDestroy {
  private utilisateurService = inject(UtilisateurService);
  private evenementService = inject(EvenementService);
  private requetesEvenements = new Subscription();
  private requetesPage = new Subscription();
  private forumService = inject(ForumService);
  session = inject(SessionService);

  membres = signal<Utilisateur[]>([]);
  villeChoisie = signal('');
  chargementCommunaute = signal(true);
  erreurCommunaute = signal('');

  villes = computed(() => {
    const parVille = new Map<string, VilleMembres>();
    for (const membre of this.membres()) {
      const ville = membre.ville?.trim();
      if (!ville) continue;

      const cle = normaliserVille(ville);
      const groupe = parVille.get(cle);
      if (groupe) {
        groupe.nombre++;
      } else {
        parVille.set(cle, { ville, nombre: 1 });
      }
    }
    return [...parVille.values()].sort((a, b) => a.ville.localeCompare(b.ville, 'fr'));
  });

  membresVille = computed(() => {
    const ville = normaliserVille(this.villeChoisie());
    return ville
      ? this.membres().filter((membre) => normaliserVille(membre.ville ?? '') === ville)
      : [];
  });
  evenements = signal<Evenement[]>([]);
  inscriptions = signal<Record<number, MonInscription | null>>({});
  evenementEnCours = signal<number | null>(null);
  sujets = signal<Sujet[]>([]);
  nombreCommentaires = signal<Partial<Record<number, number>>>({});
  chargementEvenements = signal(true);
  erreurEvenements = signal('');
  erreurInscription = signal('');
  chargementForum = signal(true);
  erreurForum = signal('');

  ilYa = ilYa;
  initiales = initiales;
  teinteAvatar = teinteAvatar;

  ngOnInit(): void {
    this.chargerCommunaute();
    this.chargerEvenements();
    this.chargerForum();
  }

  // GET /users : on compte les membres par ville pour la carte.
  chargerCommunaute(): void {
    this.requetesPage.add(this.utilisateurService.lister().subscribe({
      next: (membres) => {
        this.membres.set(membres);
        this.chargementCommunaute.set(false);
      },
      error: (erreur) => {
        this.erreurCommunaute.set(messageErreur(erreur, 'Impossible de charger les membres.'));
        this.chargementCommunaute.set(false);
      },
    }));
  }

  ngOnDestroy(): void {
    this.requetesPage.unsubscribe();
    this.requetesEvenements.unsubscribe();
  }

  // GET /api/events : les 3 prochains, avec l'inscription de l'utilisateur pour chacun.
  chargerEvenements(): void {
    this.requetesEvenements.unsubscribe();
    this.requetesEvenements = new Subscription();
    this.chargementEvenements.set(true);
    this.erreurEvenements.set('');
    this.requetesEvenements.add(this.evenementService.lister().subscribe({
      next: (liste) => {
        const prochains = liste.slice(0, 3);
        this.inscriptions.set({});
        this.evenements.set(prochains);
        this.chargementEvenements.set(false);
        for (const evenement of prochains) {
          this.requetesEvenements.add(this.evenementService.monInscription(evenement.id).subscribe({
            next: (inscription) => this.inscriptions.update((statuts) => ({ ...statuts, [evenement.id]: inscription })),
            error: () => this.inscriptions.update((statuts) => ({ ...statuts, [evenement.id]: null })),
          }));
        }
      },
      error: (erreur) => {
        this.erreurEvenements.set(messageErreur(erreur, 'Impossible de charger les événements.'));
        this.chargementEvenements.set(false);
      },
    }));
  }

  // GET /api/posts : les 3 derniers sujets, puis le nombre de commentaires de chacun.
  chargerForum(): void {
    this.requetesPage.add(this.forumService.lister(null).subscribe({
      next: (liste) => {
        const derniers = liste.slice(0, 3);
        this.sujets.set(derniers);
        this.chargementForum.set(false);
        if (derniers.length === 0) return;

        const requetes = derniers.map((sujet) =>
          this.forumService.commentaires(sujet.id).pipe(catchError(() => of(null))),
        );
        this.requetesPage.add(forkJoin(requetes).subscribe((listes) => {
          const nombres: Record<number, number> = {};
          derniers.forEach((sujet, index) => {
            const commentaires = listes[index];
            if (commentaires) nombres[sujet.id] = commentaires.length;
          });
          this.nombreCommentaires.set(nombres);
        }));
      },
      error: (erreur) => {
        this.erreurForum.set(messageErreur(erreur, 'Impossible de charger les discussions.'));
        this.chargementForum.set(false);
      },
    }));
  }

  desinscrire(evenementId: number): void {
    this.evenementEnCours.set(evenementId);
    this.erreurInscription.set('');
    this.requetesPage.add(this.evenementService.desinscrire(evenementId).subscribe({
      next: () => this.apresChangement(),
      error: (erreur) => this.echecInscription(erreur),
    }));
  }

  private echecInscription(erreur: unknown): void {
    this.evenementEnCours.set(null);
    this.erreurInscription.set(messageErreur(erreur, "Impossible de modifier l’inscription."));
  }

  // Après une inscription ou une désinscription, on recharge pour avoir les bonnes jauges.
  private apresChangement(): void {
    this.evenementEnCours.set(null);
    this.chargerEvenements();
  }
}
