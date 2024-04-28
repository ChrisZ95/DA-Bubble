import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelthreadComponent } from './channelthread.component';

describe('ChannelthreadComponent', () => {
  let component: ChannelthreadComponent;
  let fixture: ComponentFixture<ChannelthreadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelthreadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChannelthreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
