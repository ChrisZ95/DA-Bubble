import { Injectable } from '@angular/core';
import { FirestoreService } from './../firestore.service';
import { Component,OnInit,OnDestroy,HostListener,ElementRef,Renderer2,Output,EventEmitter,ViewChild,ViewEncapsulation} from '@angular/core';
import { ChatService } from '../services/chat.service';
import { ChannelService } from '../services/channel.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor( public firestoreService: FirestoreService, private chatService: ChatService, private eRef: ElementRef, private renderer: Renderer2, public channelService: ChannelService) { }

  @Output() userDetails = new EventEmitter<string>();
  @Output() channelDetails = new EventEmitter<string>();


  currentUid: any;
  allUsers: any = [];
  allChannels: any = [];
  filteredUser: any;
  filteredEntities: any = [];
  showDropdown: boolean = false;
  focusOnTextEditor: boolean = false;

}
