import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddPeopleToNewChannelComponent } from './dialog-add-people-to-new-channel.component';

describe('DialogAddPeopleToNewChannelComponent', () => {
  let component: DialogAddPeopleToNewChannelComponent;
  let fixture: ComponentFixture<DialogAddPeopleToNewChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAddPeopleToNewChannelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogAddPeopleToNewChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
