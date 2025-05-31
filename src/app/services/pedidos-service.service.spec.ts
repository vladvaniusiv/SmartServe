import { TestBed } from '@angular/core/testing';

import { PedidosService } from './pedidos-service.service';

describe('PedidosServiceService', () => {
  let service: PedidosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PedidosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
