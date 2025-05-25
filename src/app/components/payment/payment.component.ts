import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';  // Importa CommonModule
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment',
  standalone: true,
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  imports: [CommonModule,FormsModule]
  
})
export class PaymentComponent {
  phone_number: string = '';
  requires_training: boolean = true;
  staff_count: number = 0;
  totalPrice: number = 0;
  selectedPaymentMethod: string = 'bank'; 
  iban: string = '';
  accountHolder: string = '';
  ibanError: string = '';
  accountHolderError: string = '';
  name: string = ''; // Almacena el nombre del usuario


  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.phone_number = navigation.extras.state['phone_number'] || '';
      this.requires_training = navigation.extras.state['requires_training'] === true;
      this.staff_count = navigation.extras.state['staff_count'] ?? 0;
      this.name = navigation.extras.state['name'] || 'Usuario';
      this.updatePrice();
    }
  }

  updatePrice() {
    const basePrice = 50; // Registro
    const trainingPrice = this.requires_training ? 50 : 0; // Formación opcional
    const staffPrice = this.staff_count * 10; // 10€ por cada usuario de personal

    this.totalPrice = basePrice + trainingPrice + staffPrice;
  }

  validateIBAN() {
    if (this.selectedPaymentMethod === 'bizum') {
      this.ibanError = '';
      return;
    }

    const ibanPattern = /^[A-Z]{2}\d{22}$/; // España: ES+22 dígitos
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

   submitPayment() {
    this.validateIBAN();
    this.validateAccountHolder();

    if (this.ibanError || this.accountHolderError) {
      alert('Corrige los errores antes de continuar.');
      return;
    }

    console.log('Pago realizado con éxito.');
    alert(`Pago realizado con éxito. Total: €${this.totalPrice}`);
    this.router.navigate(['/#/']);
  }
}