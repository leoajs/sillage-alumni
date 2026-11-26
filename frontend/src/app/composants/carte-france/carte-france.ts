import { Component, EventEmitter, Input, Output } from '@angular/core';
import { normaliserVille } from '../../outils/format';

// Nombre de membres dans une ville
export interface VilleMembres {
  ville: string;
  nombre: number;
}

// Position des principales villes sur le dessin de la carte (même repère que le contour).
const POSITIONS: Record<string, { x: number; y: number }> = {
  paris: { x: 302, y: 147 },
  nanterre: { x: 296, y: 146 },
  lille: { x: 330, y: 45 },
  amiens: { x: 300, y: 87 },
  rouen: { x: 252, y: 114 },
  caen: { x: 193, y: 129 },
  reims: { x: 369, y: 124 },
  metz: { x: 455, y: 132 },
  nancy: { x: 455, y: 157 },
  strasbourg: { x: 518, y: 164 },
  mulhouse: { x: 502, y: 212 },
  brest: { x: 28, y: 175 },
  rennes: { x: 141, y: 191 },
  'le mans': { x: 216, y: 197 },
  orleans: { x: 284, y: 203 },
  angers: { x: 186, y: 228 },
  tours: { x: 236, y: 233 },
  nantes: { x: 146, y: 242 },
  dijon: { x: 410, y: 237 },
  besancon: { x: 449, y: 241 },
  poitiers: { x: 222, y: 280 },
  limoges: { x: 258, y: 323 },
  'clermont-ferrand': { x: 332, y: 326 },
  lyon: { x: 402, y: 327 },
  'saint-etienne': { x: 384, y: 346 },
  grenoble: { x: 437, y: 360 },
  bordeaux: { x: 185, y: 381 },
  toulouse: { x: 266, y: 452 },
  montpellier: { x: 363, y: 452 },
  pau: { x: 193, y: 470 },
  marseille: { x: 423, y: 470 },
  toulon: { x: 445, y: 480 },
  nice: { x: 498, y: 447 },
  perpignan: { x: 324, y: 505 },
  ajaccio: { x: 558, y: 550 },
};

@Component({
  selector: 'app-carte-france',
  templateUrl: './carte-france.html',
  styleUrl: './carte-france.scss',
})
export class CarteFrance {
  @Input() villes: VilleMembres[] = [];
  @Input() villeChoisie = '';
  @Output() villeSelectionnee = new EventEmitter<string>();

  // Contour simplifié de la France métropolitaine et de la Corse
  readonly contour =
    'M310 18 L336 35 L374 81 L402 73 L402 93 L440 107 L464 112 L488 128 L536 141 L520 168 L512 222 L486 229 L452 305 L488 319 L473 365 L488 418 L508 442 L472 479 L444 481 L424 476 L392 464 L368 455 L336 476 L330 499 L335 519 L276 516 L236 499 L208 505 L136 467 L150 452 L158 394 L160 331 L160 305 L122 261 L122 241 L96 226 L32 209 L18 177 L40 160 L88 151 L144 160 L144 128 L132 99 L158 102 L164 119 L216 113 L256 84 L272 70 L272 29 Z';
  readonly corse = 'M584 487 L590 539 L576 582 L552 551 L558 510 Z';

  // Les villes qu'on sait placer sur la carte, avec la taille de leur cercle
  pointsSurCarte() {
    const plusGrand = Math.max(1, ...this.villes.map((v) => v.nombre));
    return this.villes
      .filter((v) => POSITIONS[normaliserVille(v.ville)])
      .map((v) => ({
        ...v,
        ...POSITIONS[normaliserVille(v.ville)],
        rayon: 7 + (v.nombre / plusGrand) * 11,
      }));
  }
}
