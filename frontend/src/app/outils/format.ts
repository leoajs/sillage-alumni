// Petites fonctions d'affichage partagées par plusieurs pages.

export function initiales(prenom: string, nom: string): string {
  return ((prenom?.[0] ?? '') + (nom?.[0] ?? '')).toUpperCase();
}

// Les noms arrivent parfois en un seul bloc ("Léa Martin") : on prend la première lettre de chaque mot.
export function initialesDepuisNom(nomComplet: string): string {
  const mots = nomComplet.trim().split(' ');
  return initiales(mots[0] ?? '', mots[mots.length - 1] ?? '');
}

// Chaque personne garde toujours la même couleur d'avatar, calculée depuis son identifiant.
const TEINTES = ['bleu', 'vert', 'violet', 'ambre', 'rose'];
export function teinteAvatar(id: number): string {
  return TEINTES[id % TEINTES.length];
}

// "il y a 5 min", "il y a 3 h", "il y a 2 j", puis la date.
export function ilYa(dateIso: string): string {
  const minutes = Math.floor((Date.now() - new Date(dateIso).getTime()) / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  const jours = Math.floor(heures / 24);
  if (jours < 7) return `il y a ${jours} j`;
  return new Date(dateIso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Le backend renvoie ses erreurs au format ErreurDto { message, details }.
export function messageErreur(erreur: any, parDefaut: string): string {
  const corps = erreur?.error;
  if (corps?.details) {
    const premier = Object.values(corps.details)[0];
    if (typeof premier === 'string') return premier;
  }
  if (typeof corps?.message === 'string' && corps.message) return corps.message;
  // 0 = aucune réponse, 5xx sans message = le proxy n'a pas pu joindre le backend
  if (erreur?.status === 403 && typeof erreur?.error === 'string' && erreur.error.includes('CORS')) {
    return 'Requête refusée par le backend (CORS). Vérifie la configuration du proxy.';
  }
  if (erreur?.status === 0 || erreur?.status >= 500) {
    return 'Le serveur ne répond pas. Le backend Sillage est-il lancé (port 8082) ?';
  }
  return parDefaut;
}
// Pour comparer les noms de villes malgré les accents, la casse et les espaces.
export function normaliserVille(ville: string): string {
  return ville.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
