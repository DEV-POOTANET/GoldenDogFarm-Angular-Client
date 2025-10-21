import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DogHealthChecksComponent } from './dog-health-checks.component';

describe('DogHealthChecksComponent', () => {
  let component: DogHealthChecksComponent;
  let fixture: ComponentFixture<DogHealthChecksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DogHealthChecksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DogHealthChecksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
