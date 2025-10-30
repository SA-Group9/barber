import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Account } from '../common/models/account.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentAccount = new BehaviorSubject<Account | null>(null);
  currentAccount$ = this.currentAccount.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      const storedAccount = localStorage.getItem('currentAccount');
      if (storedAccount) {
        this.currentAccount.next(JSON.parse(storedAccount));
      }
    }
  }

  setAccount(account: Account) {
    if (this.isBrowser) {
      localStorage.setItem('currentAccount', JSON.stringify(account));
    }
    this.currentAccount.next(account);
  }

  getAccount(): Account | null {
    return this.currentAccount.value;
  }

  getAccountFromApi(telNumber: string): Observable<Account> {
    const params = new HttpParams().set('telNumber', telNumber);
    return this.http.get<Account>(`api/account/getAccount`, { params });
  }

  onLogoutButton() {
    if (this.isBrowser) {
      localStorage.removeItem('currentAccount');
    }
    this.currentAccount.next(null);
    this.router.navigate(['/login']);
  }

  hasRole(expectedRoles: string[]): boolean {
    const account = this.getAccount();
    if (!account || !account.role) return false;
    return expectedRoles.includes(account.role);
  }
}
