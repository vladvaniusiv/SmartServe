import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment.development';

@Component({
  standalone: true,
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css'],
  imports: [CommonModule, FormsModule]
})
export class PedidosComponent implements OnInit {
  pedidos: any[] = [];
  estadosDisponibles = ['pendiente', 'en preparación', 'en camino', 'entregado', 'cancelado'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  parsearPlatos(platos: string): any[] {
    try {
      return JSON.parse(platos);
    } catch (e) {
      return [];
    }
  }

cargarPedidos(): void {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders(token ? {
      'Authorization': `Bearer ${token}`
    } : {});

    // Primero obtenemos todos los platos para mapear los nombres
    this.http.get<any[]>(environment.apiUrl + 'api/platos', { headers }).subscribe({
      next: (platosCatalogo) => {
        // Luego obtenemos los pedidos
        this.http.get<any[]>(environment.apiUrl + 'api/pedidos', { headers }).subscribe({
          next: (data) => {
            this.pedidos = data.map(pedido => {
              const platos = typeof pedido.platos === 'string'
                ? JSON.parse(pedido.platos)
                : pedido.platos;

              const platosConNombre = platos.map((p: any) => {
                // CORRECCIÓN: Usar plato_id en lugar de id
                const encontrado = platosCatalogo.find(plato => plato.id === p.plato_id);
                return {
                  ...p,
                  nombre: encontrado ? encontrado.nombre : 'Desconocido'
                };
              });

              return {
                ...pedido,
                platos: platosConNombre
              };
            });
          },
          error: err => console.error('Error al cargar pedidos:', err)
        });
      },
      error: err => console.error('Error al cargar platos:', err)
    });
  }
}

  actualizarEstado(pedido: any): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders(token ? {
        'Authorization': `Bearer ${token}`
      } : {});

    this.http.put(environment.apiUrl+`api/pedidos/${pedido.id}/estado`, { estado: pedido.estado }, { headers }).subscribe({
      next: () => alert('Estado actualizado'),
      error: err => alert('Error al actualizar estado')
    });
  }
  }

  eliminarPedido(id: number, estado: string): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders(token ? {
        'Authorization': `Bearer ${token}`
      } : {});
    if (estado !== 'entregado' && estado !== 'cancelado') {
      alert('Solo puedes eliminar pedidos entregados o cancelados.');
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
      this.http.delete(environment.apiUrl+`api/pedidos/${id}`,{ headers}).subscribe({
        next: () => {
          alert('Pedido eliminado');
          this.pedidos = this.pedidos.filter(p => p.id !== id);
        },
        error: err => alert('Error al eliminar el pedido')
      });
    }
  }}
}