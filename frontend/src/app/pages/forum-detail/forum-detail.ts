import { Component, DestroyRef, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Avatar } from '../../composants/avatar/avatar';
import { teinteCategorie } from '../../modeles/categories';
import { Commentaire, Sujet } from '../../modeles/forum';
import { ilYa, initiales, initialesDepuisNom, messageErreur, teinteAvatar } from '../../outils/format';
import { ForumService } from '../../services/forum.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-forum-detail',
  imports: [ReactiveFormsModule, RouterLink, Avatar],
  templateUrl: './forum-detail.html',
  styleUrl: './forum-detail.scss',
})
export class ForumDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private destruction = inject(DestroyRef);
  private forumService = inject(ForumService);
  private session = inject(SessionService);
  private fb = inject(FormBuilder);

  sujet = signal<Sujet | null>(null);
  commentaires = signal<Commentaire[]>([]);
  chargement = signal(true);
  erreur = signal('');
  envoiEnCours = signal(false);
  erreurCommentaire = signal('');

  formulaire = this.fb.nonNullable.group({
    texte: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  teinte = computed(() => teinteCategorie(this.sujet()?.categorieId ?? 0));

  initiales = initiales;
  initialesDepuisNom = initialesDepuisNom;
  teinteAvatar = teinteAvatar;
  ilYa = ilYa;

  private sujetId = 0;
  private requetesSujet = new Subscription();

  ngOnInit(): void {
    // Angular réutilise cette page quand seul l'identifiant change.
    this.route.paramMap.pipe(takeUntilDestroyed(this.destruction)).subscribe((parametres) => {
      this.chargerSujet(Number(parametres.get('id')));
    });
  }

  ngOnDestroy(): void {
    this.requetesSujet.unsubscribe();
  }

  private chargerSujet(sujetId: number): void {
    this.requetesSujet.unsubscribe();
    this.requetesSujet = new Subscription();
    this.sujetId = sujetId;
    this.sujet.set(null);
    this.commentaires.set([]);
    this.chargement.set(true);
    this.erreur.set('');
    this.erreurCommentaire.set('');
    this.envoiEnCours.set(false);
    this.formulaire.reset();

    // GET /api/posts/{id}
    this.requetesSujet.add(this.forumService.detail(sujetId).subscribe({
      next: (sujet) => {
        this.sujet.set(sujet);
        this.chargement.set(false);
      },
      error: (erreur) => {
        this.erreur.set(messageErreur(erreur, 'Ce sujet est introuvable.'));
        this.chargement.set(false);
      },
    }));
    this.requetesSujet.add(this.forumService.commentaires(sujetId).subscribe({
      next: (liste) => this.commentaires.set(liste),
      error: (erreur) => this.erreurCommentaire.set(messageErreur(erreur, 'Impossible de charger les commentaires.')),
    }));
  }

  // POST /api/posts/{id}/like
  aimer(): void {
    const requetesSujet = this.requetesSujet;
    this.forumService.basculerLike(this.sujetId).subscribe((etat) => {
      const sujet = this.sujet();
      if (sujet && !requetesSujet.closed) {
        this.sujet.set({ ...sujet, likeParMoi: etat.aime, nombreLikes: etat.nombreLikes });
      }
    });
  }

  // POST /api/posts/{id}/comments
  commenter(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }
    this.envoiEnCours.set(true);
    this.erreurCommentaire.set('');
    const requetesSujet = this.requetesSujet;
    this.forumService.commenter(this.sujetId, this.formulaire.getRawValue().texte).subscribe({
      next: (commentaire) => {
        if (requetesSujet.closed) return;
        this.commentaires.set([...this.commentaires(), commentaire]);
        this.formulaire.reset();
        this.envoiEnCours.set(false);
      },
      error: (erreur) => {
        if (requetesSujet.closed) return;
        this.erreurCommentaire.set(messageErreur(erreur, "Le commentaire n'a pas pu être publié."));
        this.envoiEnCours.set(false);
      },
    });
  }

  // DELETE /api/posts/comments/{id}
  supprimer(commentaire: Commentaire): void {
    const requetesSujet = this.requetesSujet;
    this.forumService.supprimerCommentaire(commentaire.id).subscribe({
      next: () => {
        if (requetesSujet.closed) return;
        this.commentaires.set(this.commentaires().filter((c) => c.id !== commentaire.id));
      },
      error: (erreur) => {
        if (requetesSujet.closed) return;
        this.erreurCommentaire.set(messageErreur(erreur, 'Suppression impossible.'));
      },
    });
  }

  // Le backend autorise l'auteur du commentaire et les admins.
  peutSupprimer(commentaire: Commentaire): boolean {
    const moi = this.session.utilisateur();
    return !!moi && (moi.userId === commentaire.auteurId || moi.role === 'ADMIN');
  }
}
