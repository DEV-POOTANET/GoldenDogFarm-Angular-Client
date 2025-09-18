import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDogsComponent } from './add-dogs.component';

describe('AddDogsComponent', () => {
  let component: AddDogsComponent;
  let fixture: ComponentFixture<AddDogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDogsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
