import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartSideFooterComponent } from './start-side-footer.component';

describe('StartSideFooterComponent', () => {
  let component: StartSideFooterComponent;
  let fixture: ComponentFixture<StartSideFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartSideFooterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StartSideFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
