import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpChooseAvatarComponent } from './sign-up-choose-avatar.component';

describe('SignUpChooseAvatarComponent', () => {
  let component: SignUpChooseAvatarComponent;
  let fixture: ComponentFixture<SignUpChooseAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUpChooseAvatarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SignUpChooseAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
