import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GenerateIdsService {
  constructor() {}

  generateId() {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000000);
    let uniququeId = `${random}-${timestamp}`;
    uniququeId = uniququeId.toString();
    return uniququeId;
  }
}
