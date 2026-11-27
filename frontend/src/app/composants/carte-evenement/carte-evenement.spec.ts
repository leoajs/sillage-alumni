import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Evenement } from '../../modeles/evenement';
import { CarteEvenement } from './carte-evenement';

const evenement: Evenement = {
  id: 7,
  titre: 'Afterwork',
  description: '',
  categorieId: 1,
  categorieLibelle: 'Soirée',
  statut: 'PUBLIE',
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
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('renvoie vers la fiche pour s’inscrire ou rejoindre la file', async () => {
    const fixture = TestBed.createComponent(CarteEvenement);
    fixture.componentRef.setInput('evenement', evenement);
    fixture.componentRef.setInput('inscription', { statut: null, rang: null });
    await fixture.whenStable();

    const carte = fixture.nativeElement as HTMLElement;
    expect(carte.querySelector('.actions a')?.getAttribute('href')).toBe('/evenements/7');
    expect(carte.querySelector('.actions button')).toBeNull();

    fixture.componentRef.setInput('evenement', { ...evenement, complet: true });
    await fixture.whenStable();
    expect(carte.querySelector('.actions a')?.textContent).toContain('Voir l’événement');
    expect(carte.querySelector('.actions button')).toBeNull();
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

  it('émet la désinscription uniquement après confirmation', async () => {
    const fixture = TestBed.createComponent(CarteEvenement);
    fixture.componentRef.setInput('evenement', evenement);
    fixture.componentRef.setInput('inscription', { statut: 'INSCRIT', rang: null });
    await fixture.whenStable();

    const carte = fixture.nativeElement as HTMLElement;
    const demandes: number[] = [];
    fixture.componentInstance.desinscrire.subscribe((id) => demandes.push(id));
    const bouton = carte.querySelector<HTMLButtonElement>('.bouton-depart')!;

    bouton.click();
    await fixture.whenStable();
    expect(demandes).toEqual([]);
    bouton.click();
    await fixture.whenStable();
    expect(carte.querySelector('.confirmation-depart')).toBeNull();
    expect(demandes).toEqual([]);

    bouton.click();
    await fixture.whenStable();
    carte.querySelector<HTMLButtonElement>('.confirmation-depart button')!.click();
    expect(demandes).toEqual([7]);
  });
});
