import { TestBed, async, inject } from '@angular/core/testing';

import { UrlGuard } from './url.guard';

describe('UrlGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UrlGuard]
    });
  });

  it('should ...', inject([UrlGuard], (guard: UrlGuard) => {
    expect(guard).toBeTruthy();
  }));
});
