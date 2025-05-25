import { Component } from '@angular/core';
import { UserService } from './services/user.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

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
  constructor(private userService: UserService,private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.urlAfterRedirects.startsWith('/welcome#')) {
          const newUrl = event.urlAfterRedirects.replace('/welcome#', '');
          this.router.navigateByUrl(newUrl);
        }
      });}

ngOnInit() {
  this.userService.loadUserFromLocalStorage();
}
}
