import { FirestoreService } from './../firestore.service';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { DialogProfileComponent } from '../dialog-profile/dialog-profile.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ MatMenuModule, MatButtonModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  constructor(public dialog: MatDialog,  private router: Router, private firestoreService: FirestoreService) {}
  logInUid: any;
  userForm: any;
  userName: any;
  userPhoto: any;
  userUid: any;
  guestLogIn = false;
  userIsVerified = false;

  async ngOnInit() {
    //debugger
    this.guestLogIn = false;
    const uid = localStorage.getItem('uid');
    this.userForm = await this.firestoreService.getUserData(uid);
    console.log(this.userForm)
    this.userName = this.userForm['username']
    this.userPhoto = this.userForm['photo'];
    this.userUid = this.userForm['uid']
    this.userIsVerified = this.firestoreService.auth.currentUser.emailVerified;
    if(this.userUid == 'XrnnaoBh8QcgDsAuasrCETBYdsC3') {// ID vom Gast Account
      this.guestLogIn = true;
    }
  }

  openProfileDialog() {
    this.dialog.open(DialogProfileComponent);
  }

  logOut() {
    this.router.navigate(['']);
    this.firestoreService.logOut()
  }
}
