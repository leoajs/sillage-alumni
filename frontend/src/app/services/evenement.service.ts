import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Evenement, MonInscription, NouvelEvenement } from '../modeles/evenement';

@Injectable({ providedIn: 'root' })
export class EvenementService {
  private http = inject(HttpClient);

  // GET /api/events?motCle=... : les événements à venir
  lister(motCle = ''): Observable<Evenement[]> {
    let params = new HttpParams();
    if (motCle.trim()) {
      params = params.set('motCle', motCle.trim());
    }
    return this.http.get<Evenement[]>('/api/events', { params });
  }

  detail(id: number): Observable<Evenement> {
    return this.http.get<Evenement>(`/api/events/${id}`);
  }

  // POST /api/events : réservé aux organisateurs et aux admins
  creer(evenement: NouvelEvenement): Observable<Evenement> {
    return this.http.post<Evenement>('/api/events', evenement);
  }

  // GET /api/events/{id}/inscriptions/me
  monInscription(evenementId: number): Observable<MonInscription> {
    return this.http.get<MonInscription>(`/api/events/${evenementId}/inscriptions/me`);
  }

  // POST /api/events/{id}/inscriptions : inscrit, ou place en file d'attente si complet
  inscrire(evenementId: number): Observable<MonInscription> {
    return this.http.post<MonInscription>(`/api/events/${evenementId}/inscriptions`, {});
  }

  // DELETE /api/events/{id}/inscriptions
  desinscrire(evenementId: number): Observable<void> {
    return this.http.delete<void>(`/api/events/${evenementId}/inscriptions`);
  }
}
