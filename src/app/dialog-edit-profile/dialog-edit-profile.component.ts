import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FirestoreService } from '../firestore.service';
import { doc } from '@angular/fire/firestore';

@Component({
  selector: 'app-dialog-edit-profile',
  standalone: true,
  imports: [],
  templateUrl: './dialog-edit-profile.component.html',
  styleUrl: './dialog-edit-profile.component.scss'
})
export class DialogEditProfileComponent implements OnInit{
  constructor(private dialogRef: MatDialogRef<DialogEditProfileComponent>, private firestoreService: FirestoreService) {}

  logInUid: any;
  userForm: any;
  userName: any;
  userEmail: any;
  userPhoto: any;
  userPassword: any;

  inputName: any;
  inputEmail: any;

  async ngOnInit() {
    const uid = localStorage.getItem('uid');
    this.logInUid = uid;
    this.userForm = await this.firestoreService.getUserName(uid);
    this.userName = this.userForm['username'];
    this.userEmail = this.userForm['email'];
    this.userPhoto = this.userForm['photo'];
    this.userPassword = this.userForm['password'];
  }

  closeEditProfileDialog(){
    this.dialogRef.close();
  }

  safeEditData() {
    debugger
    console.log('die uid lautet', this.logInUid)
    this.inputName = document.getElementById('userNameInput');
    this.inputEmail = document.getElementById('userEmailInput');
    const inputNameValue = this.inputName.value;
    const inpuEmailValue = this.inputEmail.value;
    if (inputNameValue === this.userName) {
     console.log('Name ist gleich')
      } else {
        console.log('name ist nicht gleich')
        this.firestoreService.changeName(this.logInUid, inputNameValue)
      }
    if (inpuEmailValue === this.userEmail) {
      console.log('email ist gleich')
      } else {
       console.log('email ist nicht gleich')
       this.firestoreService.changeEmail(this.logInUid, inpuEmailValue, this.userPassword)
      }
      this.closeEditProfileDialog()
    }
}
