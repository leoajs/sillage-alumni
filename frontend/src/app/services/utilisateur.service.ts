import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Experience, Formation, NouvelleExperience, Utilisateur } from '../modeles/utilisateur';

@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private http = inject(HttpClient);

  // GET /users : l'annuaire des comptes actifs
  lister(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>('/users');
  }

  consulter(userId: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`/users/${userId}`);
  }

  // GET /api/users/{id}/experiences
  experiences(userId: number): Observable<Experience[]> {
    return this.http.get<Experience[]>(`/api/users/${userId}/experiences`);
  }

  ajouterExperience(userId: number, experience: NouvelleExperience): Observable<Experience> {
    return this.http.post<Experience>(`/api/users/${userId}/experiences`, experience);
  }

  // GET /api/users/{id}/formations
  formations(userId: number): Observable<Formation[]> {
    return this.http.get<Formation[]>(`/api/users/${userId}/formations`);
  }
}
