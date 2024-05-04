import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timestamp',
  pure: false,
  standalone: true,
})
export class TimestampPipe implements PipeTransform {
  weekday: string = '';
  date: any = [];
  valueArr: any = [];

  transform(value: string, ...args: unknown[]): unknown {
    const milliseconds = parseInt(value, 10);
    if (isNaN(milliseconds)) {
      return 'Ungültige Eingabe';
    }

    const dateObj = new Date(milliseconds);
    const weekday = this.convertWeekday(dateObj.getDay());
    const day = dateObj.getDate();
    const month = this.convertMonth(dateObj.getMonth());
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const seconds = dateObj.getSeconds();

    const formattedDate = `${weekday}, ${day}. ${month} ${year}`;
    const formattedTime = `${hours}:${minutes}:${seconds} Uhr`;

    return [formattedDate, formattedTime];
  }

  convertWeekday(day: number): string {
    const daysMap: string[] = [
      'Sonntag',
      'Montag',
      'Dienstag',
      'Mittwoch',
      'Donnerstag',
      'Freitag',
      'Samstag',
    ];
    return daysMap[day] || 'Ungültiger Wochentag';
  }

  convertMonth(month: number): string {
    const monthsMap: string[] = [
      'Januar',
      'Februar',
      'März',
      'April',
      'Mai',
      'Juni',
      'Juli',
      'August',
      'September',
      'Oktober',
      'November',
      'Dezember',
    ];
    return monthsMap[month] || 'Ungültiger Monat';
  }
}
