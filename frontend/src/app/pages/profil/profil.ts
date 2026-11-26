import { Component, OnInit, inject, signal } from '@angular/core';
import { Avatar } from '../../composants/avatar/avatar';
import { Utilisateur } from '../../modeles/utilisateur';
import { initiales, teinteAvatar } from '../../outils/format';
import { SessionService } from '../../services/session.service';
import { UtilisateurService } from '../../services/utilisateur.service';

@Component({
  selector: 'app-profil',
  imports: [Avatar],
  templateUrl: './profil.html',
  styleUrl: './profil.scss',
})
export class Profil implements OnInit {
  private session = inject(SessionService);
  private utilisateurService = inject(UtilisateurService);

  profil = signal<Utilisateur | null>(null);
  erreur = signal(false);

  initiales = initiales;
  teinteAvatar = teinteAvatar;

  ngOnInit(): void {
    const utilisateur = this.session.utilisateur();
    if (!utilisateur) {
      this.erreur.set(true);
      return;
    }

    this.utilisateurService.consulter(utilisateur.userId).subscribe({
      next: (profil) => this.profil.set(profil),
      error: () => this.erreur.set(true),
    });
  }
}
