import { FirestoreService } from './../firestore.service';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { doc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dialog-edit-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog-edit-profile.component.html',
  styleUrl: './dialog-edit-profile.component.scss'
})
export class DialogEditProfileComponent implements OnInit{
  constructor(private dialogRef: MatDialogRef<DialogEditProfileComponent>, private firestoreService: FirestoreService, public router: Router) {}

  logInUid: any;
  userForm: any;
  userName: any;
  userEmail: any;
  userPhoto: any;
  userPassword: any;

  inputName: any;
  inputEmail: any;
  emailVerified = false;
  user: any;

  emailIsNotUpToDate = false;
  succesDelete = false;

  chooseIcon = true;

  async ngOnInit() {
    console.log(this.firestoreService.auth)
    const uid = localStorage.getItem('uid');
    this.logInUid = uid;
    this.userForm = await this.firestoreService.getUserData(uid);
    console.log(this.userForm)
    this.userName = this.userForm['username'];
    this.userEmail = this.userForm['email'];
    this.userPhoto = this.userForm['photo'];
    this.userPassword = this.userForm['password'];
    this.user = this.firestoreService.auth.currentUser;
    this.emailVerified = this.firestoreService.auth.currentUser.emailVerified;
    console.log(this.emailVerified)
    console.log(this.user)
    this.checkEmailVerification();
  }

  checkEmailVerification() {
    const userEmailFirestoreDatabase = this.userEmail.toLowerCase();
    const authEmailAuthentification = this.firestoreService.auth.currentUser.email.toLowerCase();
    if(userEmailFirestoreDatabase == authEmailAuthentification) {
     console.log('email in databse und auth sind gleich');
     this.emailIsNotUpToDate = false;
    } else {
      console.log('email in databse und auth sind nicht gleich')
      this.emailIsNotUpToDate = true;
    }
  }

  closeEditProfileDialog(){
    this.dialogRef.close();
  }

  safeEditData() {
    // debugger
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
       this.firestoreService.updateEmail(inpuEmailValue, this.logInUid)
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

    async changeEmail() {
      this.firestoreService.updateEmail(this.userEmail, this.logInUid)
    }

    async sendNewVerificationMail() {
      if (this.user) {
        await this.firestoreService.sendVerificationEmail(this.user, this.userEmail);
      }
    }

    async deleteUserAccount() {
      this.succesDelete = await this.firestoreService.deleteAccount(this.logInUid);
      if (this.succesDelete === true) {
        this.closeEditProfileDialog()
        this.router.navigate(['']);
      } else {
        console.log('User konnte nicht gelöscht werden')
      }
    }

}
