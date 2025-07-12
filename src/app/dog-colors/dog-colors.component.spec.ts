import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DogColorsComponent } from './dog-colors.component';

describe('DogColorsComponent', () => {
  let component: DogColorsComponent;
  let fixture: ComponentFixture<DogColorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DogColorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DogColorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
