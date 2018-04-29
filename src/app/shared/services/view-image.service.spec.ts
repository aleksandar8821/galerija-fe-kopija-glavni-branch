import { TestBed, inject } from '@angular/core/testing';

import { ViewImageService } from './view-image.service';

describe('ViewImageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ViewImageService]
    });
  });

  it('should be created', inject([ViewImageService], (service: ViewImageService) => {
    expect(service).toBeTruthy();
  }));
});
