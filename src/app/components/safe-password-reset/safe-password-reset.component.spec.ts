import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SafePasswordResetComponent } from './safe-password-reset.component';

describe('SafePasswordResetComponent', () => {
  let component: SafePasswordResetComponent;
  let fixture: ComponentFixture<SafePasswordResetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SafePasswordResetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SafePasswordResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
