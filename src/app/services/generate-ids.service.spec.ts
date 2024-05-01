import { TestBed } from '@angular/core/testing';

import { GenerateIdsService } from './generate-ids.service';

describe('GenerateIdsService', () => {
  let service: GenerateIdsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenerateIdsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
