import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
  imports: [CommonModule],

})
export class WelcomeComponent {
  user: any = null;

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: any) {
    // Solo ejecuta el código en el navegador, no en SSR
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
      }
    }
  }

getLogoUrl(): string {
  const base = window.location.pathname.includes('github.io') ? '/SmartServe/' : '';
  return `${base}assets/images/SmartServe/logo.png`;
}

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  goToCreateUser() {
    this.router.navigate(['/create-user']);
  }
  goToUpdateUser() {
    this.router.navigate(['/update-user']);
  }
  goToListPersonal() {
    this.router.navigate(['/personal-list']);
  }

  goToCreateMenu() {
    this.router.navigate(['/create-menu']);
  }

  goToCreateDishes(){
    this.router.navigate(['/create-dishes']);
  }

  goToCreateCategory(){
    this.router.navigate(['/create-category']);
  }

  goToListCategory(){
    this.router.navigate(['/list-category']);
  }

  goToListPlatos(){
    this.router.navigate(['/list-platos']);
  }

  goToListMenus() {
    this.router.navigate(['/menus']);
  }
  
  goToEditMenu() {
    this.router.navigate(['/menus/editar']);
  }
}