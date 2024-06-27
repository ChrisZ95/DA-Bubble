import { FirestoreService } from './../firestore.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { doc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { DialogDeleteProfileComponent } from '../dialog-delete-profile/dialog-delete-profile.component';
import { Router } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';


@Component({
  selector: 'app-dialog-edit-profile',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
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
  showInputInformationEmailInUse = false;
  loadingScreen = false;
  imageSelected: boolean = false;
  imageSrc:any;

  chooseIcon = true;

  async ngOnInit() {
    const uid = localStorage.getItem('uid');
    this.logInUid = uid;
    this.userForm = await this.firestoreService.getUserData(uid);
    this.userName = this.userForm['username'];
    this.userEmail = this.userForm['email'];
    this.userPhoto = this.userForm['photo'];
    this.userPassword = this.userForm['password'];
    this.user = this.firestoreService.auth.currentUser;
    this.emailVerified = this.firestoreService.auth.currentUser.emailVerified;
    this.checkEmailVerification();
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageSrc = e.target?.result;
        this.imageSelected = true;
      };
      reader.readAsDataURL(file);
    }
  }

  checkEmailVerification() {
    this.loadingScreen = true;
    const userEmailFirestoreDatabase = this.userEmail.toLowerCase();
    const authEmailAuthentification = this.firestoreService.auth.currentUser.email.toLowerCase();
    if(userEmailFirestoreDatabase == authEmailAuthentification) {
     this.emailIsNotUpToDate = false;
     this.loadingScreen = false;
    } else {
      this.emailIsNotUpToDate = true;
      this.loadingScreen = false;
    }
  }

  closeEditProfileDialog(){
    this.dialogRef.close();
  }

  safeEditData() {
    this.loadingScreen = true;
    this.inputName = document.getElementById('userNameInput');
    this.inputEmail = document.getElementById('userEmailInput');
    const inputNameValue = this.inputName.value;
    const inpuEmailValue = this.inputEmail.value;
    this.changeUserIcon();
    if (inputNameValue === this.userName) {
      } else {
        this.firestoreService.changeName(this.logInUid, inputNameValue)
      }
    if (inpuEmailValue === this.userEmail) {
      this.closeEditProfileDialog()
      } else {
       this.changeEmail(inpuEmailValue)
      }
      this.loadingScreen = false;
    }

    async changeUserIcon() {
      this.loadingScreen = true;
      this.firestoreService.deleteUserIcon(this.userPhoto, this.logInUid);
      const fileInput = document.getElementById('profile-picture-input') as HTMLInputElement;
      const file = fileInput.files?.[0];
      if (file) {
        const icon = file;
        const userIconTokenURL = await this.firestoreService.uploadUserIconIntoStorage(this.logInUid, icon);
        await this.firestoreService.uploadUserIconIntoDatabase(this.logInUid, userIconTokenURL);
      }
      this.loadingScreen = false;
    }

    async changeEmail(inpuEmailValue: any) {
      try {
        const result = await this.firestoreService.updateEmail(inpuEmailValue, this.logInUid);
        this.showInputInformationEmail = false;
        this.showInputInformationEmailInUse = false;

        if (result === 'auth/correct') {
          await this.firestoreService.logOut();
          localStorage.setItem('resetEmail', 'true');
          this.closeEditProfileDialog()
        } else if (result === 'auth/requires-recent-login') {
          this.showInputInformationEmail = true;
        } else if (result === 'auth/false') {
          this.showInputInformationEmail = true;
        } else if (result == 'auth/email-already-in-use') {
          this.showInputInformationEmailInUse = true;
        }
      } catch (error) {
      }
    }



    async sendNewVerificationMail() {
      this.loadingScreen = true;
      if (this.user) {
        await this.firestoreService.sendVerificationEmail(this.user);
      }
      this.loadingScreen = false;
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
