import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CarteEvenement } from '../../composants/carte-evenement/carte-evenement';
import { CATEGORIES_EVENEMENT } from '../../modeles/categories';
import { Evenement, MonInscription } from '../../modeles/evenement';
import { messageErreur } from '../../outils/format';
import { EvenementService } from '../../services/evenement.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-evenements',
  imports: [FormsModule, RouterLink, CarteEvenement],
  templateUrl: './evenements.html',
  styleUrl: './evenements.scss',
})
export class Evenements implements OnInit, OnDestroy {
  private evenementService = inject(EvenementService);
  private requetesEvenements = new Subscription();
  session = inject(SessionService);

  categories = CATEGORIES_EVENEMENT;

  evenements = signal<Evenement[]>([]);
  inscriptions = signal<Record<number, MonInscription | null>>({});
  categorieChoisie = signal<number | null>(null); // null = toutes
  recherche = '';
  chargement = signal(true);
  erreur = signal('');
  evenementEnCours = signal<number | null>(null);

  // Le filtre par catégorie se fait dans le navigateur : l'API filtre par mot-clé et lieu.
  evenementsAffiches = computed(() => {
    const categorie = this.categorieChoisie();
    return categorie === null
      ? this.evenements()
      : this.evenements().filter((evenement) => evenement.categorieId === categorie);
  });

  ngOnInit(): void {
    this.charger();
  }

  ngOnDestroy(): void {
    this.requetesEvenements.unsubscribe();
  }

  // GET /api/events?motCle=...
  charger(): void {
    this.requetesEvenements.unsubscribe();
    this.requetesEvenements = new Subscription();
    this.chargement.set(true);
    this.erreur.set('');
    this.requetesEvenements.add(this.evenementService.lister(this.recherche).subscribe({
      next: (liste) => {
        this.inscriptions.set({});
        this.evenements.set(liste);
        this.chargement.set(false);
        this.chargerInscriptions(liste);
      },
      error: (erreur) => {
        this.erreur.set(messageErreur(erreur, 'Impossible de charger les événements.'));
        this.chargement.set(false);
      },
    }));
  }

  choisirCategorie(categorieId: number | null): void {
    this.categorieChoisie.set(categorieId);
  }

  estMonEvenement(evenement: Evenement): boolean {
    return evenement.auteurId === this.session.utilisateur()?.userId;
  }

  inscrire(evenementId: number): void {
    this.evenementEnCours.set(evenementId);
    this.evenementService.inscrire(evenementId).subscribe({
      next: () => this.apresChangement(),
      error: (erreur) => this.echec(erreur),
    });
  }

  desinscrire(evenementId: number): void {
    this.evenementEnCours.set(evenementId);
    this.evenementService.desinscrire(evenementId).subscribe({
      next: () => this.apresChangement(),
      error: (erreur) => this.echec(erreur),
    });
  }

  // GET /api/events/{id}/inscriptions/me pour chaque événement affiché
  private chargerInscriptions(liste: Evenement[]): void {
    for (const evenement of liste) {
      this.requetesEvenements.add(this.evenementService.monInscription(evenement.id).subscribe({
        next: (inscription) => this.inscriptions.update((statuts) => ({ ...statuts, [evenement.id]: inscription })),
        error: () => this.inscriptions.update((statuts) => ({ ...statuts, [evenement.id]: null })),
      }));
    }
  }

  // On recharge la liste pour mettre à jour les jauges et les statuts.
  private apresChangement(): void {
    this.evenementEnCours.set(null);
    this.charger();
  }

  private echec(erreur: unknown): void {
    this.evenementEnCours.set(null);
    this.erreur.set(messageErreur(erreur, "L'opération n'a pas pu aboutir."));
  }
}
