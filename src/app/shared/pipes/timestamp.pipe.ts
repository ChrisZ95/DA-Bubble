import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timestamp',
  pure: false,
  standalone: true,
})
export class TimestampPipe implements PipeTransform {

  transform(value: string, timeFrame: string): string {
    const milliseconds = parseInt(value, 10);
    if (isNaN(milliseconds)) {
      return 'Ungültige Eingabe';
    }

    const dateObj = new Date(milliseconds);
    const today = new Date();
    const isToday = dateObj.toDateString() === today.toDateString();
    const weekday = this.convertWeekday(dateObj.getDay());
    const day = dateObj.getDate();
    const month = this.convertMonth(dateObj.getMonth());

    if (timeFrame === 'day') {
      return isToday ? 'heute' : `${weekday}, ${day}. ${month}`;
    } else if (timeFrame === 'time') {
      return this.formatTime(dateObj);
    } else {
      return 'Ungültiger Argumenttyp';
    }
  }

  formatTime(date: Date): string {
    const hours = this.padZero(date.getHours());
    const minutes = this.padZero(date.getMinutes());
    return `${hours}:${minutes}`;
  }

  padZero(value: number): string {
    return value < 10 ? '0' + value : value.toString();
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
