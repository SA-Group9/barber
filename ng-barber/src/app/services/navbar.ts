import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavbarService {
  private scrollToSectionSubject = new ReplaySubject<string>(1);
  scrollToSection$ = this.scrollToSectionSubject.asObservable();

  triggerScrollTo(sectionId: string) {
    this.scrollToSectionSubject.next(sectionId);
  }
}
