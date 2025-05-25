import { Component,Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar-menu.component.html',
  styleUrl: './navbar-menu.component.css',
  standalone: true,
})
export class NavbarComponent {
  @Input() config: any;
  @Input() languages: string[] = []; 
  @Input() restaurantName: string = '';
  @Input() description: string = '';
  @Input() logo: string | null = null;
  @Input() themeClass: string = '';


  getLogoUrl(): string {
      //return `${this.logo}`;
      //return this.logo ? `/assets/images/menus/logos/${this.logo}` : '';
      if (!this.logo) return '';
        return this.logo 
      ? `${environment.baseHref}assets/images/menus/logos/${this.logo}`
      : '';
    }
}