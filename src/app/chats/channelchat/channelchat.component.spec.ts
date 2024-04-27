import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelchatComponent } from './channelchat.component';

describe('ChannelchatComponent', () => {
  let component: ChannelchatComponent;
  let fixture: ComponentFixture<ChannelchatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelchatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChannelchatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
