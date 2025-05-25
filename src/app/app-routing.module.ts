import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';
import { RegisterComponent } from './components/register/register.component';
import { PaymentComponent } from './components/payment/payment.component';
import { LoginComponent } from './components/login/login.component';
import { CreateUserComponent } from './components/create-user/create-user.component';
import { ConfiguracionComponent } from './components/configuracion/configuracion.component';
import { PersonalListComponent } from './components/personal-list/personal-list.component';
import { CreateMenuComponent } from './menu/create/create-menu.component';
import { CreateDishesComponent } from './platos/create/create-dishes.component';
import { CreateCategoriaComponent } from './platos/categoria/create/create-categoria.component';
import { ListCategoriaComponent } from './platos/categoria/list/list-categoria.component';
import { EditCategoriaComponent } from './platos/categoria/edit/edit-categoria.component';
import { ListPlatosComponent } from './platos/list-platos/list-platos.component';
import { EditPlatoComponent } from './platos/edit/edit-plato.component';
import { ListMenuComponent } from './menu/list/list-menu.component';
import { EditMenuComponent } from './menu/edit/edit-menu.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { ShowMenuComponent } from './menu/show-menu/show-menu.component';


const routes: Routes = [
  
  {path: 'pedidos', component: PedidosComponent },
  {path: 'menus/:id', component: ShowMenuComponent },
  {path: 'menus', component: ListMenuComponent },
  {path: 'menus/editar/:id', component: EditMenuComponent },
  {path: 'categorias/editar/:id', component: EditCategoriaComponent },
  {path: 'list-category', component: ListCategoriaComponent },
  {path: 'create-category', component: CreateCategoriaComponent },
  {path: 'platos/editar/:id', component: EditPlatoComponent },
  {path: 'create-dishes', component: CreateDishesComponent },
  {path: 'list-platos', component: ListPlatosComponent },
  {path: 'create-menu', component: CreateMenuComponent },
  {path: 'personal-list', component: PersonalListComponent },
  {path:'update-user', component: ConfiguracionComponent },
  {path:'create-user', component: CreateUserComponent },
  {path:'login', component: LoginComponent },
  {path:'payment', component: PaymentComponent },
  {path:'register', component: RegisterComponent },
  {path:'welcome', component: WelcomeComponent},
  {path:'', redirectTo:'welcome', pathMatch: 'full'},
  {path:'**', redirectTo:'welcome', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { 
    useHash: true,
    initialNavigation: 'enabledBlocking'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
