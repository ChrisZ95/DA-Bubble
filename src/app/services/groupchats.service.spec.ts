import { TestBed } from '@angular/core/testing';

import { GroupchatsService } from './groupchats.service';

describe('GroupchatsService', () => {
  let service: GroupchatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupchatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
