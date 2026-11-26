import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { EnTete } from '../../composants/en-tete/en-tete';
import { messageErreur } from '../../outils/format';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inscription',
  imports: [ReactiveFormsModule, RouterLink, EnTete],
  templateUrl: './inscription.html',
  styleUrl: './inscription.scss',
})
export class Inscription {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  formulaire = this.fb.nonNullable.group({
    prenom: ['', [Validators.required, Validators.maxLength(80)]],
    nom: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.minLength(6)]],
    ville: ['', Validators.maxLength(100)],
  });

  envoiEnCours = signal(false);
  erreur = signal('');

  // POST /users crée le compte, puis POST /api/auth/login connecte directement le nouveau membre.
  creerCompte(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }
    this.envoiEnCours.set(true);
    this.erreur.set('');

    const valeurs = this.formulaire.getRawValue();
    this.auth
      .inscrire({ ...valeurs, ville: valeurs.ville.trim() || null })
      .pipe(switchMap(() => this.auth.connecter(valeurs.email, valeurs.motDePasse)))
      .subscribe({
        next: () => this.router.navigate(['/tableau-de-bord']),
        error: (erreur) => {
          this.erreur.set(messageErreur(erreur, "L'inscription a échoué. Réessaie dans un instant."));
          this.envoiEnCours.set(false);
        },
      });
  }

  champInvalide(nom: 'prenom' | 'nom' | 'email' | 'motDePasse'): boolean {
    const champ = this.formulaire.controls[nom];
    return champ.invalid && champ.touched;
  }
}
