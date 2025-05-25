import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Location } from '@angular/common'; // 👈 importar Location

@Component({
  selector: 'app-nav-bar',
  standalone: false,
  
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  isLoggedIn = false;
  user: any = null;

  constructor(
    private authService: AuthService, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
    private location: Location 

  ) {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
        this.isLoggedIn = true;
      }
    }
  }

  return() {
    this.location.back();
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.logout();
      localStorage.removeItem('user'); // Borra el usuario del almacenamiento local
    }
    this.isLoggedIn = false;
    this.router.navigate(['/login']); // Redirige al login
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

  goToPedidos(){
    this.router.navigate(['/pedidos']);
  }
}
