import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Service } from '../common/models/service.model';
import { Barber } from '../common/models/barber.model';
import { Account } from '../common/models/account.model';

@Injectable({
  providedIn: 'root'
})
export class BarberService {

  constructor(private http: HttpClient) { }
  
  getAllBarbers(): Observable<Barber[]> {
    return this.http.get<Barber[]>(`api/barber/all`);
  }

  getAllAvailableBarbers(): Observable<Barber[]> {
    return this.http.get<Barber[]>(`api/barber/allAvailable`);
  }

  getBarberInfoFromAccountId(accountId: number): Observable<Account> {
    return this.http.get<Account>(`api/barber/id/${accountId}`);
  }

  toggleBarberStatus(barber: Barber): Observable<Barber> {
    return this.http.put<Barber>(`api/barber/toggleStatus`, barber)
  }

  getBarberStatus(accountId: number): Observable<any> {
    return this.http.post<any>('/api/barber/getBarberStatus', { accountId });
  }
}
