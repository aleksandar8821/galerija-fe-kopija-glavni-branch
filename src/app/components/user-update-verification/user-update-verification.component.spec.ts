import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserUpdateVerificationComponent } from './user-update-verification.component';

describe('UserUpdateVerificationComponent', () => {
  let component: UserUpdateVerificationComponent;
  let fixture: ComponentFixture<UserUpdateVerificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserUpdateVerificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserUpdateVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
