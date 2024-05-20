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

  chooseIcon = true;

  async ngOnInit() {
    debugger
    const uid = localStorage.getItem('uid');
    this.logInUid = uid;
    this.userForm = await this.firestoreService.getUserData(uid);
    console.log(this.userForm)
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

    async changeUserIcon() {
      this.firestoreService.deleteUserIcon(this.userPhoto, this.logInUid);
      const fileInput = document.getElementById('profile-picture-input') as HTMLInputElement;
      const file = fileInput.files?.[0];
      if (file) {
        const icon = file;
        console.log(icon)
        console.log('Name des Bildes',icon.name);
        console.log('Bild wurde erstellt am',icon.lastModified);
        const userIconTokenURL = await this.firestoreService.uploadUserIconIntoStorage(this.logInUid, icon);
        await this.firestoreService.uploadUserIconIntoDatabase(this.logInUid, userIconTokenURL);
      } else {
        console.log('Kein Bild ausgewählt');
      }
    }
}
