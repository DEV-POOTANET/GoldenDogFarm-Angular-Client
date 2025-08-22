import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthCheckListComponent } from './health-check-list.component';

describe('HealthCheckListComponent', () => {
  let component: HealthCheckListComponent;
  let fixture: ComponentFixture<HealthCheckListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthCheckListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthCheckListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
