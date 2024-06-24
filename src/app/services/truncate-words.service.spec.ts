import { TestBed } from '@angular/core/testing';

import { TruncateWordsService } from './truncate-words.service';

describe('TruncateWordsService', () => {
  let service: TruncateWordsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TruncateWordsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
