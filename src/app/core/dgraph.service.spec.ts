import { TestBed } from '@angular/core/testing';

import { DgraphService } from './dgraph.service';

describe('DgraphService', () => {
  let service: DgraphService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DgraphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
