import { TestBed } from '@angular/core/testing';
import Service from './res-service';

describe('Service', () => {
  let service: Service;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Service],
    });

    service = TestBed.inject(Service);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
