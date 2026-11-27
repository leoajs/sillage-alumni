import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { teinteCategorie } from '../../modeles/categories';
import { Evenement } from '../../modeles/evenement';
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

  private charger(id: number): void {
    this.requetes.unsubscribe();
    this.requetes = new Subscription();
    this.id = id;
    this.evenement.set(null);
    this.erreur.set('');
    this.chargement.set(true);

    if (!Number.isSafeInteger(id) || id <= 0 || id > 2147483647) {
      this.erreur.set('Cet événement est introuvable.');
      this.chargement.set(false);
      return;
    }

    this.requetes.add(this.evenementService.detail(id).subscribe({
      next: (evenement) => {
        this.evenement.set(evenement);
        this.chargement.set(false);
      },
      error: (erreur) => {
        this.erreur.set(messageErreur(erreur, 'Impossible de charger cet événement.'));
        this.chargement.set(false);
      },
    }));
  }
}
