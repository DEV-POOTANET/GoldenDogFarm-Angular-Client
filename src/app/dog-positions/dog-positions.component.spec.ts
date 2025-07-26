import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DogPositionsComponent } from './dog-positions.component';

describe('DogPositionsComponent', () => {
  let component: DogPositionsComponent;
  let fixture: ComponentFixture<DogPositionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DogPositionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DogPositionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
