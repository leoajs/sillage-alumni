import { Routes } from '@angular/router';
import { EspaceMembre } from './composants/espace-membre/espace-membre';
import { connecteGuard, inviteGuard } from './gardes/connecte.guard';
import { Accueil } from './pages/accueil/accueil';
import { Annuaire } from './pages/annuaire/annuaire';
import { Connexion } from './pages/connexion/connexion';
import { EvenementNouveau } from './pages/evenement-nouveau/evenement-nouveau';
import { Evenements } from './pages/evenements/evenements';
import { ForumDetail } from './pages/forum-detail/forum-detail';
import { ForumNouveau } from './pages/forum-nouveau/forum-nouveau';
import { Forum } from './pages/forum/forum';
import { Inscription } from './pages/inscription/inscription';
import { Profil } from './pages/profil/profil';
import { TableauDeBord } from './pages/tableau-de-bord/tableau-de-bord';

export const routes: Routes = [
  // Pages publiques : si on est déjà connecté, on part au tableau de bord.
  { path: '', component: Accueil, canActivate: [inviteGuard] },
  { path: 'connexion', component: Connexion, canActivate: [inviteGuard] },
  { path: 'inscription', component: Inscription, canActivate: [inviteGuard] },

  // Espace membre : barre latérale + barre du haut, et la page choisie au centre.
  {
    path: '',
    component: EspaceMembre,
    canActivate: [connecteGuard],
    children: [
      { path: 'tableau-de-bord', component: TableauDeBord, data: { titre: 'Tableau de bord' } },
      { path: 'evenements', component: Evenements, data: { titre: 'Espace événements' } },
      { path: 'evenements/nouveau', component: EvenementNouveau, data: { titre: 'Créer un événement' } },
      { path: 'annuaire', component: Annuaire, data: { titre: 'Annuaire des alumni' } },
      { path: 'profil', component: Profil, data: { titre: 'Mon profil' } },
      { path: 'forum', component: Forum, data: { titre: 'Forum & discussions' } },
      { path: 'forum/nouveau', component: ForumNouveau, data: { titre: 'Nouveau post' } },
      { path: 'forum/:id', component: ForumDetail, data: { titre: 'Discussion' } },
    ],
  },

  // Route de repli : toute adresse inconnue renvoie vers l'accueil.
  { path: '**', redirectTo: '' },
];
