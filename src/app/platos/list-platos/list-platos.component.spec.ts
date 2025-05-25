import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPlatosComponent } from './list-platos.component';

describe('ListPlatosComponent', () => {
  let component: ListPlatosComponent;
  let fixture: ComponentFixture<ListPlatosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListPlatosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPlatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
