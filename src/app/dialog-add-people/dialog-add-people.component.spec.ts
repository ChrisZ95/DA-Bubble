import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddPeopleComponent } from './dialog-add-people.component';

describe('DialogAddPeopleComponent', () => {
  let component: DialogAddPeopleComponent;
  let fixture: ComponentFixture<DialogAddPeopleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAddPeopleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogAddPeopleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
