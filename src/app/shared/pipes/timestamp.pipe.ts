import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timestamp',
  pure: false,
  standalone: true,
})
export class TimestampPipe implements PipeTransform {
  transform(value: number | string, ...args: string[]): string {
    const timestamp = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(timestamp) || !isFinite(timestamp)) {
      return '';
    }

    const date = new Date(timestamp);
    const today = new Date();

    if (args.includes('time')) {
      return `${this.padZero(date.getHours())}:${this.padZero(
        date.getMinutes()
      )}:${this.padZero(date.getSeconds())}`;
    } else if (this.isSameDay(date, today)) {
      return 'heute';
    } else {
      return this.formatDate(date);
    }
  }

  private padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  private formatDate(date: Date): string {
    const days = [
      'Sonntag',
      'Montag',
      'Dienstag',
      'Mittwoch',
      'Donnerstag',
      'Freitag',
      'Samstag',
    ];
    const months = [
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
    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const dayOfMonth = date.getDate();

    return `${day}, ${dayOfMonth}. ${month}`;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
}
