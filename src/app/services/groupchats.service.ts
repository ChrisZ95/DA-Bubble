import { Injectable } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  getDoc,
  updateDoc,
  where,
  QueryDocumentSnapshot,
  deleteField,
  deleteDoc,
  onSnapshot,
  query,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { FirestoreService } from '../firestore.service';

@Injectable({
  providedIn: 'root',
})
export class GroupchatsService {
  public firestore: any;
  constructor(
    private myFirebaseApp: FirebaseApp,
    private firestoreService: FirestoreService
  ) {
    this.firestore = getFirestore(myFirebaseApp); //??
  }

  private allchats: string[] = [];
  private allUsers: any[] = [];
  private groupChatsWithCurrentUserSubject = new BehaviorSubject<any[]>([]);
  public groupChatsWithCurrentUser$: Observable<any[]> =
    this.groupChatsWithCurrentUserSubject.asObservable();

  // Adrian FirestoreService
  async getAllChatsDocumentIds(): Promise<string[]> {
    try {
      const chatsCollection = collection(this.firestore, 'chats');
      const chatsSnapshot = await getDocs(chatsCollection);
      const chatIds = chatsSnapshot.docs.map((doc) => doc.id);
      this.allchats = chatIds;
      return chatIds;
    } catch (error) {
      console.error('Error fetching chat IDs:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<void> {
    try {
      const usersCollection = collection(this.firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      this.allUsers = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  filterInput(inputs: string[]): string[] {
    const regex = /^(\w{5}-){2,}\w{5}$/;
    return inputs.filter((input) => regex.test(input));
  }

  async displayValue(): Promise<void> {
    await Promise.all([this.getAllChatsDocumentIds(), this.getAllUsers()]);

    const filteredInputs = this.filterInput(this.allchats);
    this.allchats = filteredInputs;

    await this.compareGroupChatsWithUsers();
  }

  async compareGroupChatsWithUsers(): Promise<void> {
    const groupChats = this.allchats;
    const currentUserShortId = this.firestoreService.currentuid.substring(0, 5);

    const groupChatsWithCurrentUser = groupChats.filter((groupId) => {
      const groupIdParts = groupId
        .split('-')
        .map((part) => part.substring(0, 5));
      return groupIdParts.includes(currentUserShortId);
    });
    // Adrian
    // console.log('Group chats with current user:', groupChatsWithCurrentUser); 

    const matchedUsers = this.allUsers.filter((user) => {
      const userShortId = user.id.substring(0, 5);
      return groupChatsWithCurrentUser.some((groupId) => {
        const groupIdParts = groupId
          .split('-')
          .map((part) => part.substring(0, 5));
        return groupIdParts.includes(userShortId);
      });
    });
    // Adrian
    // console.log('Matched users:', matchedUsers);

    const result = groupChatsWithCurrentUser.map((groupId) => {
      return {
        groupId,
        users: matchedUsers.filter((user) => {
          const userShortId = user.id.substring(0, 5);
          const groupIdParts = groupId
            .split('-')
            .map((part) => part.substring(0, 5));
          return groupIdParts.includes(userShortId);
        }),
      };
    });

    this.groupChatsWithCurrentUserSubject.next(result);
  }

  // Adrian
  // ngOnInit() {
  //   this.groupchatService.displayValue().then(() => {
  //     this.groupchatService.groupChatsWithCurrentUser$.subscribe((groupChats) => {
  //       this.groupChatsWithCurrentUser = groupChats;
  //     });
  //   });
  // }
}
