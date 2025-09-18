import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDogdtlComponent } from './view-dogdtl.component';

describe('ViewDogdtlComponent', () => {
  let component: ViewDogdtlComponent;
  let fixture: ComponentFixture<ViewDogdtlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDogdtlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDogdtlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
