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

export function datePublication(dateIso: string): string {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return '';

  const aujourdhui = new Date();
  const hier = new Date(aujourdhui);
  hier.setDate(hier.getDate() - 1);

  const heure = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (date.toDateString() === aujourdhui.toDateString()) return `Aujourd’hui à ${heure}`;
  if (date.toDateString() === hier.toDateString()) return `Hier à ${heure}`;
  const jour = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '');
  return `${jour} à ${heure}`;
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
