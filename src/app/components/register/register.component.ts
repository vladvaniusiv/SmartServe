import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [FormsModule, CommonModule]
})
export class RegisterComponent {
  user = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone_number: '',
    company_name: '',
    staff_count: 0,
    requires_training: false
  };

  passwordError = '';
  phoneError = '';
  staffError = '';
  registrationError = '';

  constructor(private authService: AuthService, private router: Router) {}

  validatePhoneNumber() {
    const phonePattern = /^[0-9]{9}$/;
    if (!this.user.phone_number || !this.user.phone_number.match(phonePattern)) {
      this.phoneError = 'Número de teléfono inválido. Debe contener exactamente 9 dígitos.';
      return false;
    } else {
      this.phoneError = '';
      return true;
    }
  }

  validateStaffCount() {
    if (this.user.staff_count < 0) {
      this.staffError = 'El número de empleados no puede ser negativo.';
      return false;
    } else {
      this.staffError = '';
      return true;
    }
  }

  register(event: Event) {
    event.preventDefault(); // Evita que la página se recargue al enviar el formulario

    this.passwordError = '';
    this.phoneError = '';   
    this.staffError = '';
    this.registrationError = '';

    if (!this.user.password || this.user.password.length < 8) {
      this.passwordError = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    if (this.user.password !== this.user.password_confirmation) {
      this.passwordError = 'Las contraseñas no coinciden.';
      return;
    }

    console.log('Enviando datos al servidor...', this.user);

    this.authService.register(this.user).subscribe(
      response => {
        console.log('Usuario registrado exitosamente', response);
        this.router.navigate(['/payment'], {
          state: { 
            phone_number: this.user.phone_number,
            requires_training: this.user.requires_training ?? false,
            staff_count: this.user.staff_count,
            name: this.user.name
          }
        });
      },
      error => {
        console.error('Errores en el registro', error?.error?.errors);
        if (error?.status === 422 && error?.error?.errors) {
          if (error.error.errors.email?.includes('The email has already been taken.')) {
            this.registrationError = 'El correo electrónico ya está en uso.';
          } else {
            this.registrationError = Object.values(error.error.errors).join('<br>');
          }
        } else {
          this.registrationError = 'Error en el registro. Inténtalo de nuevo.';
        }
      }
    );
  }
}