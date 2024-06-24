import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TruncateWordsService {

  constructor() { }

  setTruncateLimitWorkspace(width: number): number {
    if (width >= 1400) {
      return 60;
    } else if (width < 400) {
      return 20;
    } else if (width < 850) {
      return 80;
    } else {
      return 10;
    }
  }

  setTruncateLimitChatHeader(width: number): number {
    console.log(width)
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
