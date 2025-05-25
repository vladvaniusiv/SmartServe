import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  getIconPath(iconName: string | undefined): string {
    if (!iconName) return '';
    return `${this.apiUrl}storage/menus/social_icons/${iconName}`;
  }

  // Cambiar método getSocialIconUrl
  getSocialIconUrl(icon: string): string {
    //return `/assets/images/menus/social_icons/${icon}`;
    const cleanIcon = icon.replace('social_icons/', '');
    return `/assets/images/menus/social_icons/${cleanIcon}`;
  }
}