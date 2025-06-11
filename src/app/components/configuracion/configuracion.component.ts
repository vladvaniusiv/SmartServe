import { Component,OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css'],
  imports: [FormsModule, CommonModule]
})
export class ConfiguracionComponent implements OnInit {
  user = {
    name: '',
    email: '',
    phone_number: '',
    company_name: '',
    staff_count: 0,
    role: '',
  };
  newStaffCount = 0;
  showPayment = false;
  totalPrice = 0;
  selectedPaymentMethod = 'bank';
  iban = '';
  accountHolder = '';
  ibanError = '';
  accountHolderError = '';

  constructor(private authService: AuthService, private router: Router) {
    this.authService.getUserData().subscribe(response => {
      if (response) {
        this.user = response;
        this.newStaffCount = response.staff_count ?? 0;
      }
    });
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
        this.newStaffCount = this.user.staff_count;
      }
    }
  }
  

  updateStaffCount() {
    if (this.newStaffCount > this.user.staff_count) {
      this.showPayment = true;
      this.totalPrice = (this.newStaffCount - this.user.staff_count) * 10; // 10€ por usuario adicional
    } else {
      this.showPayment = false;
    }
  }

  validateIBAN() {
    if (this.selectedPaymentMethod === 'bizum') {
      this.ibanError = '';
      return;
    }
    const ibanPattern = /^[A-Z]{2}\d{22}$/;
    if (!this.iban.match(ibanPattern)) {
      this.ibanError = 'IBAN inválido. Debe comenzar con 2 letras y tener 22 dígitos.';
    } else {
      this.ibanError = '';
    }
  }

  validateAccountHolder() {
    if (this.selectedPaymentMethod === 'bizum') {
      this.accountHolderError = '';
      return;
    }
    if (!this.accountHolder.trim()) {
      this.accountHolderError = 'El nombre del titular no puede estar vacío.';
    } else {
      this.accountHolderError = '';
    }
  }

  updateData() {
    if (this.showPayment) {
      this.validateIBAN();
      this.validateAccountHolder();
      if (this.ibanError || this.accountHolderError) {
        alert('Corrige los errores antes de continuar.');
        return;
      }
    }

    const previousCompanyName = this.user.company_name;
    this.authService.updateUserData({
      name: this.user.name,
      email: this.user.email,
      phone_number: this.user.phone_number,
      company_name: this.user.company_name,
      staff_count: this.newStaffCount
    }).subscribe(
      response => {
        alert('Datos actualizados con éxito.');
        if (previousCompanyName !== this.user.company_name) {
          this.updateEmployeeCompanyName();
        } else {
          this.router.navigate(['/welcome']);
        }
      },
      error => {
        console.error('Error al actualizar', error);
        alert('Hubo un error. Inténtalo de nuevo.');
      }
    );
  }
    updateEmployeeCompanyName() {
      this.authService.updateEmployeeCompanyName({ company_name: this.user.company_name }).subscribe(
        () => {
          alert('El nombre de la empresa ha sido actualizado en los empleados.');
          this.router.navigate(['/welcome']);
        },
        error => {
          console.error('Error al actualizar empleados', error);
          alert('No se pudo actualizar el nombre de la empresa en los empleados.');
        }
      );
    }
}