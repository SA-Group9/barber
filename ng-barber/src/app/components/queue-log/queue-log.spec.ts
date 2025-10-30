import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueueLog } from './queue-log';

describe('QueueLog', () => {
  let component: QueueLog;
  let fixture: ComponentFixture<QueueLog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QueueLog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueueLog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
