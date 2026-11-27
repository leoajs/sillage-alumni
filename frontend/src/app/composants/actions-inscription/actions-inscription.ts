import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { MonInscription } from '../../modeles/evenement';

@Component({
  selector: 'app-actions-inscription',
  templateUrl: './actions-inscription.html',
  styleUrl: './actions-inscription.scss',
})
export class ActionsInscription {
  @Input() inscription: MonInscription | null | undefined;
  @Input() complet = false;
  @Input() enCours = false;
  @Input() autoriserInscription = false;

  @Output() inscrire = new EventEmitter<void>();
  @Output() desinscrire = new EventEmitter<void>();

  confirmationDepart = signal(false);

  get statut(): MonInscription['statut'] {
    return this.inscription?.statut ?? null;
  }

  get participe(): boolean {
    return this.statut === 'INSCRIT' || this.statut === 'EN_ATTENTE';
  }

  confirmerDepart(): void {
    this.confirmationDepart.set(false);
    this.desinscrire.emit();
  }
}
