import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewGalleryComponent } from './create-new-gallery.component';

describe('CreateNewGalleryComponent', () => {
  let component: CreateNewGalleryComponent;
  let fixture: ComponentFixture<CreateNewGalleryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateNewGalleryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
