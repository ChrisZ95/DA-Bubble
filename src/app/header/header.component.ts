import { FirestoreService } from './../firestore.service';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { DialogProfileComponent } from '../dialog-profile/dialog-profile.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { doc, onSnapshot } from "firebase/firestore";

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
    this.guestLogIn = false;
    const uid = localStorage.getItem('uid');

    const userDocRef = this.firestoreService.getUserDocRef(uid);
    onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        this.userForm = { id: doc.id, ...userData };
        this.userName = this.userForm['username'];
        this.userPhoto = this.userForm['photo'];
        this.userUid = this.userForm['uid'];
        this.userIsVerified = this.firestoreService.auth.currentUser.emailVerified;

        if (this.userUid === 'XrnnaoBh8QcgDsAuasrCETBYdsC3') {
          this.guestLogIn = true;
        }
      } else {
        console.log("Das Benutzerdokument existiert nicht.");
      }
    });
  }

  openProfileDialog() {
    this.dialog.open(DialogProfileComponent);
  }

  logOut() {
    this.router.navigate(['']);
    this.firestoreService.logOut()
  }
}
