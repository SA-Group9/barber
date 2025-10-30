import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Account } from '../common/models/account.model';
import { Password } from '../common/models/password.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  constructor(private http: HttpClient) { }

  createAccount(account: Account) {
    return this.http.post(`api/account/register`, account);
  }

  createAccountByAdmin(account: Account) {
    return this.http.post(`api/account/create`, account);
  }

  authenticateAccount(account: Account): Observable<boolean> {
    return this.http.post<boolean>(`api/account/authenticate`, account);
  }

  searchAccounts(page: number, size: number, keyword: string, role: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('keyword', keyword)
      .set('role', role || '');

    return this.http.get(`api/account/search`, { params });
  }

  getAccountById(id: number): Observable<Account> {
    return this.http.get<Account>(`api/account/getById/${id}`);
  }

  editAccount(account: Account) {
    return this.http.put<Account>(`api/account/edit`, account);
  }

  editAccountByAdmin(account: Account) {
    return this.http.put<Account>(`api/account/editByAdmin`, account);
  }

  changePassword(password: Password) {
    return this.http.put<Password>(`api/account/changePassword`, password);
  }

  checkTelNumber(telNumber: string) {
    return this.http.get<boolean>(`api/account/check-tel?telNumber=${telNumber}`);
  }

  toggleIsQueuing(account: Account) {
    return this.http.put<Account>(`api/account/toggleIsQueuing`, account);
  }

  resetQueuing(accountId: number) {
    return this.http.put<Account>(`api/account/reset-queueing`, { accountId });
  }

}
