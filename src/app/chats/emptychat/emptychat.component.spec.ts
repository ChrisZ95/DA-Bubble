import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptychatComponent } from './emptychat.component';

describe('EmptychatComponent', () => {
  let component: EmptychatComponent;
  let fixture: ComponentFixture<EmptychatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptychatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmptychatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
