import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPlatoComponent } from './edit-plato.component';

describe('EditPlatoComponent', () => {
  let component: EditPlatoComponent;
  let fixture: ComponentFixture<EditPlatoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditPlatoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPlatoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
