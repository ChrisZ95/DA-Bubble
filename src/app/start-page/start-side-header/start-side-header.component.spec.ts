import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartSideHeaderComponent } from './start-side-header.component';

describe('StartSideHeaderComponent', () => {
  let component: StartSideHeaderComponent;
  let fixture: ComponentFixture<StartSideHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartSideHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StartSideHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
