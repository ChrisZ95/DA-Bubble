import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../firestore.service';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-sign-up-choose-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sign-up-choose-avatar.component.html',
  styleUrl: './sign-up-choose-avatar.component.scss'
})
export class SignUpChooseAvatarComponent implements OnInit {
  selectedAvatar: string | null = null;
  userData: User | undefined;

  @Output() backToSignUpClicked: EventEmitter<any> = new EventEmitter();
  @Output() accountCreated: EventEmitter<any> = new EventEmitter();

  constructor(private firestoreService: FirestoreService) { }

  avatar = ['./../../../assets/images/80. avatar interaction (1).png',
   './../../../assets/images/80. avatar interaction (2).png',
   './../../../assets/images/80. avatar interaction (3).png',
   './../../../assets/images/80. avatar interaction (4).png',
   './../../../assets/images/80. avatar interaction (5).png',
  ]

  ngOnInit(): void {
    this.getUserDocument();
  }


  backToSignUp() {
    this.backToSignUpClicked.emit();
    console.log('back to sign up button continue')
  }

  chooseAvatar(index: number) {
    console.log('Avatar ausgewählt:', index);
    this.selectedAvatar = this.avatar[index];
  }

  createAccount() {
    this.accountCreated.emit();
    console.log('account wurde erstellt')
  }

  // getUserDokument() {
  //   // const createdUserDoc = await this.firestoreService.signUpNewUser(this.user);
  //   // if (createdUserDoc) {
  //   //   // Hier können Sie das erstellte Dokument verwenden, z.B. speichern oder anzeigen
  //   //   console.log("Erstelltes Benutzerdokument:", createdUserDoc);
  //   // } else {
  //   //   console.error("Benutzerdokument konnte nicht erstellt werden.");
  //   // }

  // }

  async getUserDocument() {
    const docId = 'hUI1Rirdb1PBnNAYOl1X'; // Die Dokumenten-ID des Benutzers, die Sie abrufen möchten
    this.userData = await this.firestoreService.getUserByDocId(docId);
    console.log('Benutzerdaten erhalten:', this.userData);
  }
}
