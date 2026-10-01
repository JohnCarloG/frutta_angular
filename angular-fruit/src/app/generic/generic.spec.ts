import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Generic } from './generic';

describe('Generic', () => {
  let component: Generic;
  let fixture: ComponentFixture<Generic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Generic],
    }).compileComponents();

    fixture = TestBed.createComponent(Generic);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
