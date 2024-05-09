import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnchatComponent } from './ownchat.component';

describe('OwnchatComponent', () => {
  let component: OwnchatComponent;
  let fixture: ComponentFixture<OwnchatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnchatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OwnchatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
