import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentRecordsComponent } from './treatment-records.component';

describe('TreatmentRecordsComponent', () => {
  let component: TreatmentRecordsComponent;
  let fixture: ComponentFixture<TreatmentRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreatmentRecordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreatmentRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
