import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CarteSujet } from '../../composants/carte-sujet/carte-sujet';
import { CATEGORIES_FORUM } from '../../modeles/categories';
import { Sujet } from '../../modeles/forum';
import { messageErreur } from '../../outils/format';
import { ForumService } from '../../services/forum.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-forum',
  imports: [FormsModule, RouterLink, CarteSujet],
  templateUrl: './forum.html',
  styleUrl: './forum.scss',
})
export class Forum implements OnInit, OnDestroy {
  private forumService = inject(ForumService);
  private session = inject(SessionService);
  private requeteListe?: Subscription;

  categories = CATEGORIES_FORUM;

  sujets = signal<Sujet[]>([]);
  categorieChoisie = signal<number | null>(null);
  seulementMesPosts = signal(false);
  recherche = '';
  chargement = signal(true);
  erreur = signal('');

  // "Mes posts" se filtre dans le navigateur, sur l'auteur de chaque sujet.
  sujetsAffiches = computed(() => {
    const moi = this.session.utilisateur()?.userId;
    return this.seulementMesPosts() ? this.sujets().filter((sujet) => sujet.auteurId === moi) : this.sujets();
  });

  ngOnInit(): void {
    this.charger();
  }

  ngOnDestroy(): void {
    this.requeteListe?.unsubscribe();
  }

  // GET /api/posts?categorieId=...&motCle=...
  charger(): void {
    this.requeteListe?.unsubscribe();
    this.chargement.set(true);
    this.erreur.set('');
    this.requeteListe = this.forumService.lister(this.categorieChoisie(), this.recherche).subscribe({
      next: (liste) => {
        this.sujets.set(liste);
        this.chargement.set(false);
      },
      error: (erreur) => {
        this.erreur.set(messageErreur(erreur, 'Impossible de charger le forum.'));
        this.chargement.set(false);
      },
    });
  }

  choisirCategorie(categorieId: number | null): void {
    this.categorieChoisie.set(categorieId);
    this.charger();
  }

  basculerMesPosts(): void {
    this.seulementMesPosts.set(!this.seulementMesPosts());
  }

  estMonSujet(sujet: Sujet): boolean {
    return sujet.auteurId === this.session.utilisateur()?.userId;
  }

  // POST /api/posts/{id}/like : on met à jour seulement le sujet cliqué avec la réponse.
  aimer(sujetId: number): void {
    this.forumService.basculerLike(sujetId).subscribe((etat) => {
      this.sujets.set(
        this.sujets().map((sujet) =>
          sujet.id === sujetId ? { ...sujet, likeParMoi: etat.aime, nombreLikes: etat.nombreLikes } : sujet,
        ),
      );
    });
  }
}
