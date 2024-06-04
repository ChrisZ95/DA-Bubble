import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextEditorChannelComponent } from './text-editor-channel.component';

describe('TextEditorChannelComponent', () => {
  let component: TextEditorChannelComponent;
  let fixture: ComponentFixture<TextEditorChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextEditorChannelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TextEditorChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
