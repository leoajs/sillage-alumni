import { TestBed } from '@angular/core/testing';
import { Evenement } from '../../modeles/evenement';
import { CarteEvenement } from './carte-evenement';

const evenement: Evenement = {
  id: 7,
  titre: 'Afterwork',
  description: '',
  categorieId: 1,
  categorieLibelle: 'Soirée',
  auteurId: 2,
  auteurNom: 'Léa Martin',
  dateEvenement: '2026-12-18T19:00:00',
  lieu: 'Bar Le Tolbiac',
  adresse: '',
  createdAt: '2026-11-01T10:00:00',
  capaciteMax: 30,
  nombreInscrits: 12,
  placesRestantes: 18,
  complet: false,
  tauxRemplissage: 40,
};

describe('CarteEvenement', () => {
  it("prévient le parent avec l'identifiant quand on clique sur S'inscrire", async () => {
    const fixture = TestBed.createComponent(CarteEvenement);
    fixture.componentRef.setInput('evenement', evenement);
    fixture.componentRef.setInput('inscription', { statut: null, rang: null });
    await fixture.whenStable();

    let idRecu: number | null = null;
    fixture.componentInstance.inscrire.subscribe((id) => (idRecu = id));
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.bouton-plein')!.click();

    expect(idRecu).toBe(7);
  });

  it("attend le statut avant de proposer une action d'inscription", async () => {
    const fixture = TestBed.createComponent(CarteEvenement);
    fixture.componentRef.setInput('evenement', evenement);
    await fixture.whenStable();

    const carte = fixture.nativeElement as HTMLElement;
    expect(carte.querySelector('.actions button')).toBeNull();
    expect(carte.textContent).toContain('Chargement de ton inscription');
  });

  it('affiche la position dans la file d’attente', async () => {
    const fixture = TestBed.createComponent(CarteEvenement);
    fixture.componentRef.setInput('evenement', { ...evenement, complet: true });
    fixture.componentRef.setInput('inscription', { statut: 'EN_ATTENTE', rang: 2 });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('position 2');
  });
});
