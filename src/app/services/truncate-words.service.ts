import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TruncateWordsService {

  constructor() { }

  setTruncateLimitWorkspace(width: number): number {
    if (width >= 1400) {
      return 30;
    } else if (width < 400) {
      return 20;
    } else if (width < 850) {
      return 40;
    } else if (width < 1400) {
      return 14;
    } else {
      return 10;
    }
  }

  setTruncateLimitChatHeader(width: number): number {
    if (width >= 1400) {
      return 80;
    } else if(width < 360) {
      return 20;
    } else if(width < 500) {
      return 30;
    } else if(width < 1000) {
      return 20;
    } else if(width < 1400) {
      return 50;
    }  else {
      return 10;
    }
   }
}
