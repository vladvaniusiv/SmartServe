import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  standalone: true,
})
export class FooterComponent {
  @Input() location: string = '';
  @Input() wifiPassword: string = '';
  @Input() socialLinks: { name: string; url: string; icon?: string }[] = [];
  @Input() restaurantName: string = '';
  @Input() apiUrl: string = ''; 
  @Input() themeClass: string = '';

  // Cambiar método getSocialIconUrl
  getSocialIconUrl(icon: string): string {
    //return `/assets/images/menus/social_icons/${icon}`;
    //return `${environment.baseHref}assets/images/menus/social_icons/${icon}`;
    const base = window.location.hostname.includes('github.io') ? '/SmartServe/' : '';
    return `${base}assets/images/menus/social_icons/${icon}`;
  }
}