import { Role } from './session';

// GET /users et GET /users/{id} (UserResponseDto)
export interface Utilisateur {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  ville: string | null;
  role: Role;
  statut: 'ACTIF' | 'SUSPENDU' | 'SUPPRIME';
  createdAt: string;
}

// POST /users (UserRegistrationDto)
export interface NouvelUtilisateur {
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
  ville: string | null;
}

// POST /api/users/{id}/experiences
export interface NouvelleExperience {
  entreprise: string;
  poste: string;
  anneeDebut: number;
  anneeFin: number | null;
  commentaire: string | null;
}

export interface Experience extends NouvelleExperience {
  id: number;
}

// GET /api/users/{id}/formations
export interface Formation {
  id: number;
  etablissementId: number;
  etablissementNom: string;
  parcoursId: number | null;
  parcoursCode: string | null;
  parcoursIntitule: string | null;
  anneeDebut: number;
  anneeFin: number | null;
  commentaire: string | null;
}
