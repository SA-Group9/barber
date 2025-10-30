import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { NavbarService } from '../../services/navbar';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements AfterViewInit {
  @ViewChild('contact') contactSection!: ElementRef;
  @ViewChild('home') homeSection!: ElementRef;
  @ViewChild('location') locationSection!: ElementRef;
  @ViewChild('service') serviceSection!: ElementRef;

  constructor(private navbarService: NavbarService) {}

  ngAfterViewInit() {
    this.navbarService.scrollToSection$.subscribe(sectionId => {
      this.scrollToSection(sectionId);
    });
  }

  scrollToSection(sectionId: string) {
    let target: ElementRef | undefined;

    switch (sectionId) {
      case 'contact':
        target = this.contactSection;
        break;
      case 'home':
        target = this.homeSection;
        break;
      case 'location':
        target = this.locationSection;
        break;
      case 'service':
        target = this.serviceSection;
        break;
      default:
        console.warn(`Unknown section: ${sectionId}`);
        return;
    }

    if (target) {
      target.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
