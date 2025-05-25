import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule]
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  loginError = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(event: Event) {
    event.preventDefault(); // Evita recargar la página
    this.loginError = ''; // Resetea errores previos

    this.authService.login(this.credentials).subscribe(
      response => {
        console.log('Usuario autenticado:', response);
        localStorage.setItem('token', response.token); // Guardamos el token
        localStorage.setItem('user', JSON.stringify(response.user)); // Guardamos datos del usuario

        // Redirigir a la página de bienvenida
        this.router.navigate(['/#/welcome']).then(() => {
          // Pequeña pausa para asegurar la navegación antes del reload
          setTimeout(() => {
            window.location.reload();
          }, 100); // 100 ms suelen bastar
        });      },
      error => {
        console.error('Error en el login', error);
        this.loginError = 'Credenciales incorrectas. Inténtalo de nuevo.';
      }
    );
  }
}