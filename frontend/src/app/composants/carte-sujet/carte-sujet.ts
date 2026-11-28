import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { teinteCategorie } from '../../modeles/categories';
import { Sujet } from '../../modeles/forum';
import { datePublication, initialesDepuisNom, teinteAvatar } from '../../outils/format';
import { Avatar } from '../avatar/avatar';

// Carte d'un sujet du forum. Le clic sur le cœur est remonté au parent, qui appelle l'API.
@Component({
  selector: 'app-carte-sujet',
  imports: [RouterLink, Avatar],
  templateUrl: './carte-sujet.html',
  styleUrl: './carte-sujet.scss',
})
export class CarteSujet {
  @Input({ required: true }) sujet!: Sujet;
  @Input() estMonSujet = false;

  @Output() aimer = new EventEmitter<number>();

  initiales = initialesDepuisNom;
  teinteAvatar = teinteAvatar;
  datePublication = datePublication;

  get teinte(): string {
    return teinteCategorie(this.sujet.categorieId);
  }
}
