import { Injectable } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { getFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { FirestoreService } from '../firestore.service';

@Injectable({
  providedIn: 'root',
})
export class GroupchatsService {
  public firestore: any;
  constructor( private myFirebaseApp: FirebaseApp, private firestoreService: FirestoreService) {
    this.firestore = getFirestore(myFirebaseApp); //??
  }

  private allchats: string[] = [];
  private allUsers: any[] = [];
  private groupChatsWithCurrentUserSubject = new BehaviorSubject<any[]>([]);
  public groupChatsWithCurrentUser$: Observable<any[]> =
  this.groupChatsWithCurrentUserSubject.asObservable();
}
