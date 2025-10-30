import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageQueue } from './manage-queue';

describe('ManageQueue', () => {
  let component: ManageQueue;
  let fixture: ComponentFixture<ManageQueue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageQueue]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageQueue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
