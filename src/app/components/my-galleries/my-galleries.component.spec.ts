import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyGalleriesComponent } from './my-galleries.component';

describe('MyGalleriesComponent', () => {
  let component: MyGalleriesComponent;
  let fixture: ComponentFixture<MyGalleriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyGalleriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyGalleriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
