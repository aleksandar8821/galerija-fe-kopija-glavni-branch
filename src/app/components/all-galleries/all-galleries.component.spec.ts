import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllGalleriesComponent } from './all-galleries.component';

describe('AllGalleriesComponent', () => {
  let component: AllGalleriesComponent;
  let fixture: ComponentFixture<AllGalleriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllGalleriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllGalleriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
