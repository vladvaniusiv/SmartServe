import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { provideHttpClient,withFetch } from '@angular/common/http';
import { WelcomeComponent } from './welcome/welcome.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RegisterComponent } from './components/register/register.component';
import { PaymentComponent } from './components/payment/payment.component';
import { LoginComponent } from './components/login/login.component';
import { CreateUserComponent } from './components/create-user/create-user.component';
import { HttpClientModule } from '@angular/common/http';
import { ConfiguracionComponent } from './components/configuracion/configuracion.component';
import { EditCategoriaComponent } from './platos/categoria/edit/edit-categoria.component';
import { EditPlatoComponent } from './platos/edit/edit-plato.component';
import { ListPlatosComponent } from './platos/list-platos/list-platos.component';
import { TruncatePipe } from './pipes/truncate.pipe';
import { EditMenuComponent } from './menu/edit/edit-menu.component';
import { ListMenuComponent } from './menu/list/list-menu.component';
import { MenuSectionComponent } from './menu/section/menu-section.component';
import { ShowMenuComponent } from './menu/show-menu/show-menu.component';
import { PersonalListComponent } from './components/personal-list/personal-list.component';
import { CreateMenuComponent } from './menu/create/create-menu.component';
import { FooterComponent } from './menu/footer/footer.component';
import { NavbarComponent } from './menu/navbar-menu/navbar-menu.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { CreateCategoriaComponent } from './platos/categoria/create/create-categoria.component';
import { ListCategoriaComponent } from './platos/categoria/list/list-categoria.component';
import { CreateDishesComponent } from './platos/create/create-dishes.component';

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
  ],
  imports: [
    EditMenuComponent,
    ListMenuComponent,
    TruncatePipe,
    PedidosComponent,
    CreateDishesComponent,
    EditPlatoComponent,
    ListPlatosComponent,
    EditCategoriaComponent,
    CreateCategoriaComponent,
    ListCategoriaComponent,
    MenuSectionComponent,
    ShowMenuComponent,
    NavbarComponent,
    FooterComponent,
    CreateMenuComponent,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RegisterComponent,
    PersonalListComponent,
    PaymentComponent,
    WelcomeComponent,
    LoginComponent, 
    CreateUserComponent,
    ConfiguracionComponent,
    HttpClientModule,
  ],
  providers: [
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
