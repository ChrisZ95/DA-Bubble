import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThreadService {
  private messageInformationSubject = new BehaviorSubject<any>(null);
  constructor() {}
  displayThread: boolean = false;
  messageInformation: any;

  getMessage(info: any) {
    this.messageInformationSubject.next(info);
  }
  getMessageInformation() {
    return this.messageInformationSubject.asObservable();
  }
  sendReply(reply: any) {
    console.log(reply);
  }
}
