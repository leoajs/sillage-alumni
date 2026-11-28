// GET /api/events (PostEvenementResponseDto)
export interface Evenement {
  id: number;
  titre: string;
  description: string;
  categorieId: number;
  categorieLibelle: string;
  statut: 'PUBLIE' | 'ANNULE' | 'ARCHIVE';
  auteurId: number;
  auteurNom: string;
  dateEvenement: string;
  lieu: string;
  adresse: string;
  createdAt: string;
  capaciteMax: number | null;
  nombreInscrits: number;
  placesRestantes: number | null;
  complet: boolean;
  tauxRemplissage: number | null;
}

// POST /api/events (PostEvenementCreateDto)
export interface NouvelEvenement {
  titre: string;
  description: string;
  categorieId: number;
  dateEvenement: string;
  lieu: string;
  adresse: string;
  capaciteMax: number | null;
}

// GET /api/events/{id}/inscriptions/me et POST /api/events/{id}/inscriptions
// statut null = pas inscrit
export interface MonInscription {
  statut: 'INSCRIT' | 'EN_ATTENTE' | 'DESINSCRIT' | null;
  rang: number | null;
}
