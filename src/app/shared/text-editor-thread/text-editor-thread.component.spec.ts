import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextEditorThreadComponent } from './text-editor-thread.component';

describe('TextEditorThreadComponent', () => {
  let component: TextEditorThreadComponent;
  let fixture: ComponentFixture<TextEditorThreadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextEditorThreadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TextEditorThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
