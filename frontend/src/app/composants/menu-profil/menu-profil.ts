import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { initiales, teinteAvatar } from '../../outils/format';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';
import { Avatar } from '../avatar/avatar';

@Component({
  selector: 'app-menu-profil',
  imports: [Avatar, RouterLink],
  templateUrl: './menu-profil.html',
  styleUrl: './menu-profil.scss',
})
export class MenuProfil {
  private session = inject(SessionService);
  private auth = inject(AuthService);
  private router = inject(Router);

  utilisateur = this.session.utilisateur;
  ouvert = signal(false);

  mesInitiales = computed(() => {
    const moi = this.utilisateur();
    return moi ? initiales(moi.prenom, moi.nom) : '';
  });

  maTeinte = computed(() => teinteAvatar(this.utilisateur()?.userId ?? 0));

  libelleRole = computed(() => {
    switch (this.utilisateur()?.role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'ORGANISATEUR':
        return 'Organisateur';
      default:
        return 'Étudiant';
    }
  });

  basculer(): void {
    this.ouvert.set(!this.ouvert());
  }

  deconnecter(): void {
    this.auth.deconnecter();
    this.router.navigate(['/']);
  }
}
