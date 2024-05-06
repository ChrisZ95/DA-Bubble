import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, DocumentReference, DocumentData, doc, updateDoc, onSnapshot, getDoc, arrayUnion } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from './../../models/channel.class';
import { FirestoreService } from '../firestore.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  channel = new Channel();
  channelID: string = ''
  channelName = '';
  channelListNamesArray: any = [];
  channelDescription = '';
  UserName = '';
  author = ''
  channelUserAmount!: number;
  unsubchannel;
  showChannelChat: boolean = true;

  // Array to store channel list data
  channelList: any = [];

  // List of profile images for channel users
  channelProfileImagesList: any = []
  
  constructor(private readonly firestore: Firestore, private FirestoreService: FirestoreService) {
    this.unsubchannel = this.subChannelList();
  }

  getChannelRef() {
    return collection(this.firestore, 'channels');
  }

  getChannelDoc() {
    return doc(collection(this.firestore, 'channels'), this.channelID);
  }

  getChannelDocByID(ID:string) {
    return doc(collection(this.firestore, 'channels'), ID);
  }

  addChannel() {
    addDoc(collection(this.firestore, 'channels'), this.channel.toJSON());
  }

  async updateChannel(channelRef: DocumentReference, object: {}) {
    await updateDoc(channelRef, object)
  }

  getChannelName(name: string) {
    this.channelName = name;
  }

  getDescription(text: string) {
    this.channelDescription = text;
  }

  getUserName(name: string) {
    this.UserName = name;
  }

  getAuthor(author: string) {
    this.author = author;
  }

  setChannelObject(obj: any, id: string) {
    return {
      id: id || "",
      name: obj.name || "",
      users: obj.users || "",
      description: obj.description || "",
      author: obj.author || ""
    }
  }

  async addUserToChannel(channelDoc: string) {
    let channelRef = this.getChannelDocByID(channelDoc)
    const channelDocSnapshot = await getDoc(channelRef);
    const userData = channelDocSnapshot.data()?.['users'] || [];
    await this.updateChannel(channelRef, {
      users: userData
    })
  }

  subChannelList() {
    return onSnapshot(this.getChannelRef(), (list) => {
      this.channelList = [];
      this.channelListNamesArray = [];
      list.forEach(element => {
        if (element.data()['users'].includes(this.FirestoreService.currentUser?.email)) {
          this.channelList.push(this.setChannelObject(element.data(), element.id));
          this.channelListNamesArray.push(element.data()['name']);
        }
      });
    })
  };
}