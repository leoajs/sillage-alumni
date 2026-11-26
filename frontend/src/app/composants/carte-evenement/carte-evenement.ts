import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { teinteCategorie } from '../../modeles/categories';
import { Evenement, MonInscription } from '../../modeles/evenement';

// Carte d'un événement. Le parent fournit l'événement et l'inscription de l'utilisateur connecté,
// la carte prévient le parent quand on clique sur "S'inscrire" ou "Se désinscrire".
@Component({
  selector: 'app-carte-evenement',
  imports: [DatePipe],
  templateUrl: './carte-evenement.html',
  styleUrl: './carte-evenement.scss',
})
export class CarteEvenement {
  @Input({ required: true }) evenement!: Evenement;
  // undefined pendant le chargement, null si la requête échoue.
  @Input() inscription: MonInscription | null | undefined;
  @Input() estMonEvenement = false;
  @Input() enCours = false; // une requête d'inscription est en cours pour cet événement
  @Input() compact = false; // version courte pour le tableau de bord

  @Output() inscrire = new EventEmitter<number>();
  @Output() desinscrire = new EventEmitter<number>();

  get teinte(): string {
    return teinteCategorie(this.evenement.categorieId);
  }

  get statut(): string | null {
    return this.inscription?.statut ?? null;
  }

  // Inscrit ou en attente : la personne participe déjà d'une façon ou d'une autre.
  get participe(): boolean {
    return this.statut === 'INSCRIT' || this.statut === 'EN_ATTENTE';
  }
}
