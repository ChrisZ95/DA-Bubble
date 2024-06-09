import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GroupchatsService {
  constructor() {}

  // Testwerte 
  inputs = [
    'dsag8adsgadsgha9',
    '932850-934125813204',
    'uam53-fm63l',
    'oazt4-aif3m-pukl2',
    '12345-67890-abcde-aif3m-pukl2',
  ];
  //Erst der Anfang
  filterInput(inputs: string[]): string[] {
    const regex = /^(\w{5}-){2,}\w{5}$/;
    return inputs.filter((input) => regex.test(input));
  }

  displayValue() {
    const filteredInputs = this.filterInput(this.inputs);
    console.log(filteredInputs); // Output: ["oazt4-aif3m-pukl2", "12345-67890-abcde"]
  }
}
