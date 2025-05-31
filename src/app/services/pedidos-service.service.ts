import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private localBridgeUrl = 'http://localhost:3000';
  private publicBridgeUrl = 'https://pedidosmenu.loca.lt';

  // Esta función detecta si estás en GitHub Pages o en local
  private getBridgeUrl(): string {
    const isStatic = location.hostname.endsWith('github.io');
    return isStatic ? this.publicBridgeUrl : this.localBridgeUrl;
  }

  constructor(private http: HttpClient) {}

  enviarPedido(pedido: any): Observable<any> {
    const url = `${this.getBridgeUrl()}/api/pedidos`;
    return this.http.post(url, pedido);
  }

  obtenerPedidos(): Observable<any[]> {
    const url = `${this.getBridgeUrl()}/api/pedidos`;
    return this.http.get<any[]>(url);
  }
}