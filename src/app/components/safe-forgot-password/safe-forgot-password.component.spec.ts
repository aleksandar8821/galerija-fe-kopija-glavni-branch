import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SafeForgotPasswordComponent } from './safe-forgot-password.component';

describe('SafeForgotPasswordComponent', () => {
  let component: SafeForgotPasswordComponent;
  let fixture: ComponentFixture<SafeForgotPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SafeForgotPasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SafeForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
