import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-user',
  standalone: true,
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css'],
  imports: [FormsModule, CommonModule]
})
export class CreateUserComponent {
  user = {
    name: '',
    email: '',
    password: '',
    phone_number: '',
    company_name: '',
    role: 'personal' 
  };

  registrationError = '';
  showUpgradeLink: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // Detectar si estamos en el navegador
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user.company_name = JSON.parse(storedUser).company_name;
      } else {
        this.router.navigate(['/#/login']);
      }
    }
  }

  createUser(event: Event) {
    event.preventDefault(); // Evita recargar la página

    this.authService.createUser(this.user).subscribe(
      response => {
        console.log('Usuario personal creado:', response);
        alert('Usuario creado con éxito');
        this.router.navigate(['/#/welcome']);
      },
      error => {
        console.error('Error en la creación', error);
        
        if (error.status === 400 && error.error?.error?.includes('límite de empleados')) {
          this.registrationError = 'Has alcanzado el límite de empleados. ';
          this.showUpgradeLink = true; // Muestra el enlace a Configuración de Cuenta
        } else if (error.status === 422 && error.error?.error?.includes('email')) {
          this.registrationError = 'El correo electrónico ya está en uso.';
        } else {
          this.registrationError = 'Error al crear el usuario. Inténtalo de nuevo.';
        }
      }
    );
  }
  goToUpdateUser() {
    this.router.navigate(['/#/update-user']);
  }
}