import { Component,Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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
      return `${this.logo}`;
    }
}