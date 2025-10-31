import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreedingComponent } from './breeding.component';

describe('BreedingComponent', () => {
  let component: BreedingComponent;
  let fixture: ComponentFixture<BreedingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreedingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BreedingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
