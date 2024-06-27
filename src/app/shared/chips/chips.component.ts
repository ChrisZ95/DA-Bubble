import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chips',
  standalone: true,
  imports: [ FormsModule, MatFormFieldModule, MatChipsModule, MatIconModule, MatAutocompleteModule, ReactiveFormsModule, AsyncPipe, CommonModule],
  templateUrl: './chips.component.html',
  styleUrl: './chips.component.scss',
})
export class ChipsComponent implements OnInit, OnChanges {
  separatorKeysCodes: number[] = [ENTER, COMMA];
  entityCtrl = new FormControl('');
  selectedItem: any[] = [];
  @Input() allEntitys: any = [];
  @ViewChild('entityInput') entityInput!: ElementRef<HTMLInputElement>;
  @Input() label: any = 'Search for Users or Channel';
  announcer = inject(LiveAnnouncer);
  @Output() addEntity = new EventEmitter<any>();
  @Output() removedEntity = new EventEmitter<any>();
  @Output() searchEntity = new EventEmitter<any>();

  constructor() {}

  add(event: MatChipInputEvent): void {
    const value = event.value;
    if (value) {
      this.searchEntity.emit(value);
    }
    event.chipInput!.clear();
    this.entityCtrl.setValue(null);
  }

  searchUser(value: any) {
    this.searchEntity.emit(value);
  }

  remove(entity: any): void {
    const index = this.selectedItem.indexOf(entity);
    if (index >= 0) {
      this.selectedItem.splice(index, 1);
      this.announcer.announce(`Removed ${entity}`);
      this.removedEntity.emit(entity);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.addEntity.emit(event.option.value);
    this.selectedItem.push(event.option.value);
    this.entityInput.nativeElement.value = '';
    this.entityCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allEntitys.filter((entity: any) =>
      entity.toLowerCase().includes(filterValue)
    );
  }

  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allEntitys']) {
    }
  }
}
