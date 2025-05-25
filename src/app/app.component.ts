import { Component } from '@angular/core';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'SmartServe';
  nombre = 'Vladyslav'
  apellidos = 'Vaniusiv'
  retornarNombreApellidos(){
    return this.nombre + ' ' + this.apellidos;
  }
  constructor(private userService: UserService) {}

ngOnInit() {
  this.userService.loadUserFromLocalStorage();
}
}
