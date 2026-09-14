import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResturantComponent } from './restaurant';

describe('Restaurant', () => {
  let component: ResturantComponent;
  let fixture: ComponentFixture<ResturantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResturantComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResturantComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
