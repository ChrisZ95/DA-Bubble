import { FirestoreService } from './../firestore.service';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { DialogProfileComponent } from '../dialog-profile/dialog-profile.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ MatMenuModule, MatButtonModule ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  constructor(public dialog: MatDialog,  private router: Router, private firestoreService: FirestoreService) {}
  logInUid: any;
  userName: any;

  async ngOnInit() {
    const uid = localStorage.getItem('uid');
    this.userName = await this.firestoreService.getUserName(uid)
    console.log('username header (localstorage)',this.userName);
  }

  openProfileDialog() {
    this.dialog.open(DialogProfileComponent);
  }

  logOut() {
    this.router.navigate(['']);
    this.firestoreService.logOut()
  }
}
