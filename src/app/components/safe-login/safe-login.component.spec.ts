import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SafeLoginComponent } from './safe-login.component';

describe('SafeLoginComponent', () => {
  let component: SafeLoginComponent;
  let fixture: ComponentFixture<SafeLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SafeLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SafeLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
