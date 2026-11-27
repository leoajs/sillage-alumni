import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { teinteCategorie } from '../../modeles/categories';
import { Evenement, MonInscription } from '../../modeles/evenement';
import { messageErreur } from '../../outils/format';
import { EvenementService } from '../../services/evenement.service';

@Component({
  selector: 'app-evenement-detail',
  imports: [DatePipe, RouterLink],
  templateUrl: './evenement-detail.html',
  styleUrl: './evenement-detail.scss',
})
export class EvenementDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private destruction = inject(DestroyRef);
  private evenementService = inject(EvenementService);
  private requetes = new Subscription();
  private id = 0;

  evenement = signal<Evenement | null>(null);
  chargement = signal(true);
  erreur = signal('');
  introuvable = signal(false);
  inscription = signal<MonInscription | null>(null);
  chargementInscription = signal(true);
  erreurInscription = signal('');
  envoiEnCours = signal(false);
  erreurAction = signal('');
  confirmationDepart = signal(false);
  teinteCategorie = teinteCategorie;

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destruction)).subscribe((parametres) => {
      this.charger(Number(parametres.get('id')));
    });
  }

  ngOnDestroy(): void {
    this.requetes.unsubscribe();
  }

  reessayer(): void {
    this.charger(this.id);
  }

  inscriptionsFermees(evenement: Evenement): boolean {
    return evenement.statut !== 'PUBLIE'
      || new Date(evenement.dateEvenement).getTime() <= Date.now();
  }

  chargerInscription(): void {
    this.chargementInscription.set(true);
    this.erreurInscription.set('');
    this.requetes.add(this.evenementService.monInscription(this.id).subscribe({
      next: (inscription) => {
        this.inscription.set(inscription);
        this.chargementInscription.set(false);
      },
      error: (erreur) => {
        this.erreurInscription.set(messageErreur(erreur, 'Impossible de charger ton statut.'));
        this.chargementInscription.set(false);
      },
    }));
  }

  inscrire(): void {
    this.modifierInscription(this.evenementService.inscrire(this.id));
  }

  desinscrire(): void {
    this.modifierInscription(this.evenementService.desinscrire(this.id));
  }

  private charger(id: number): void {
    this.requetes.unsubscribe();
    this.requetes = new Subscription();
    this.id = id;
    this.evenement.set(null);
    this.inscription.set(null);
    this.erreur.set('');
    this.introuvable.set(false);
    this.erreurInscription.set('');
    this.erreurAction.set('');
    this.envoiEnCours.set(false);
    this.confirmationDepart.set(false);
    this.chargement.set(true);

    if (!Number.isSafeInteger(id) || id <= 0 || id > 2147483647) {
      this.introuvable.set(true);
      this.chargement.set(false);
      return;
    }

    this.chargerDetail();
  }

  private chargerDetail(): void {
    const premiereLecture = this.evenement() === null;
    this.chargement.set(true);
    this.erreur.set('');
    this.requetes.add(this.evenementService.detail(this.id).subscribe({
      next: (evenement) => {
        this.evenement.set(evenement);
        this.chargement.set(false);
        if (premiereLecture && !this.inscriptionsFermees(evenement)) {
          this.chargerInscription();
        }
      },
      error: (erreur) => {
        if (erreur.status === 404) {
          this.evenement.set(null);
          this.introuvable.set(true);
        } else {
          this.erreur.set(messageErreur(erreur, 'Impossible de charger cet événement.'));
        }
        this.chargement.set(false);
      },
    }));
  }

  private modifierInscription(requete: Observable<MonInscription | void>): void {
    const evenement = this.evenement();
    if (!evenement || this.inscriptionsFermees(evenement) || this.envoiEnCours() || this.chargement()) return;

    this.envoiEnCours.set(true);
    this.erreurAction.set('');
    this.confirmationDepart.set(false);
    this.requetes.add(requete.subscribe({
      next: (inscription) => {
        if (inscription) {
          this.inscription.set(inscription);
        } else {
          // La désinscription renvoie 204. On relit le statut côté Spring.
          this.chargerInscription();
        }
        this.envoiEnCours.set(false);
        this.chargerDetail();
      },
      error: (erreur) => {
        this.erreurAction.set(messageErreur(erreur, 'Impossible de modifier ta participation.'));
        this.envoiEnCours.set(false);
      },
    }));
  }
}
