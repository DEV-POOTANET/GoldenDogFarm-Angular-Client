import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDogsComponent } from './view-dogs.component';

describe('ViewDogsComponent', () => {
  let component: ViewDogsComponent;
  let fixture: ComponentFixture<ViewDogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDogsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
