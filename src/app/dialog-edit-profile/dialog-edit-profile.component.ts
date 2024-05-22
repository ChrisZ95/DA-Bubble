import { FirestoreService } from './../firestore.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { doc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { DialogDeleteProfileComponent } from '../dialog-delete-profile/dialog-delete-profile.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dialog-edit-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog-edit-profile.component.html',
  styleUrl: './dialog-edit-profile.component.scss'
})
export class DialogEditProfileComponent implements OnInit{
  constructor(
    private dialogRef: MatDialogRef<DialogEditProfileComponent>,
    private dialog: MatDialog,
    private firestoreService: FirestoreService,
    private router: Router
  ) {}


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
  showInputInformationEmail = false;

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
      this.closeEditProfileDialog()
      } else {
       console.log('email ist nicht gleich')
       this.changeEmail(inpuEmailValue)
      }
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

    async changeEmail(inpuEmailValue: any) {
      try {
        const result = await this.firestoreService.updateEmail(inpuEmailValue, this.logInUid);
        this.showInputInformationEmail = false;

        if (result === 'auth/correct') {
          await this.firestoreService.logOut();
          localStorage.setItem('resetEmail', 'true');
          this.closeEditProfileDialog()
        } else if (result === 'auth/requires-recent-login') {
          this.showInputInformationEmail = true;
        } else if (result === 'auth/false') {
          this.showInputInformationEmail = true;
        }
      } catch (error) {
        console.error('Error change email:', error);
      }
    }



    async sendNewVerificationMail() {
      if (this.user) {
        await this.firestoreService.sendVerificationEmail(this.user);
      }
    }

    async deleteUserAccount() {
      this.dialog.open(DialogDeleteProfileComponent);
      this.dialogRef.close();
    }

    logOut() {
      this.closeEditProfileDialog();
      this.router.navigate(['']);
      this.firestoreService.logOut()
    }
}
