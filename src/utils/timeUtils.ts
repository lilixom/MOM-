import { DayInfo } from '../types';

export const WINDOW_START = 8.5; // Timeline origin = 08:30

// Convert time string like "08:30" or "02:00+1" to decimal hours
export function toHours(t: string | number): number {
  if (typeof t === 'number') return t;
  let p = 0;
  let str = ('' + t).trim();
  if (str.includes('+1')) {
    p = 24;
    str = str.replace('+1', '').trim();
  }
  const a = str.split(':');
  return (+a[0] || 0) + (+a[1] || 0) / 60 + p;
}

// Format decimal hours into HH:MM (wrapping 24h)
export function fmtHM(h: number): string {
  let hh = ((Math.floor(h) % 24) + 24) % 24;
  let mm = Math.round((h - Math.floor(h)) * 60);
  if (mm >= 60) {
    hh = (hh + 1) % 24;
    mm -= 60;
  }
  return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
}

// Duration between start and end string
export function durOf(s: string, e: string): number {
  return toHours(e) - toHours(s);
}

// Quantity output = (Duration - Changeover) * hourlyCapacity
export function qtyOf(s: string, e: string, cap: number, co: number = 0): number {
  return Math.max(0, Math.round((durOf(s, e) - co) * cap));
}

// Fraction 0..1 relative to timeline origin 08:30
export function axisFrac(h: number): number {
  return ((((h - WINDOW_START) % 24) + 24) % 24) / 24;
}

export function axisPct(h: number): number {
  return axisFrac(h) * 100;
}

export function fmtTickHM(t: number): string {
  const lab = fmtHM(t);
  return t >= 24 ? lab + '+1' : lab;
}

export function fmtWindow(baseH: number): string {
  const t = WINDOW_START + baseH;
  return t >= 24 ? fmtHM(t) + '+1' : fmtHM(t);
}

// Split duration into segments within 08:30 -> 08:30+1 window (handles midnight wrap)
export function windowSegs(sAbs: number, eAbs: number): Array<[number, number]> {
  const dur = eAbs - sAbs;
  if (!(dur > 0)) return [];
  const fs = axisFrac(sAbs);
  const df = dur / 24;
  if (fs + df <= 1.0001) return [[fs * 100, df * 100]];
  return [
    [fs * 100, (1 - fs) * 100],
    [0, (fs + df - 1) * 100],
  ];
}

export function ymd(d: Date): string {
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
}

export function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

export function fmtMD(s: string): string {
  const p = s.split('-');
  return +p[1] + '/' + +p[2];
}

export function weekdayOf(s: string): string {
  return ['日', '一', '二', '三', '四', '五', '六'][new Date(s + 'T00:00:00').getDay()];
}

export function fmtK(n: number): string {
  return n >= 10000 ? (n / 10000).toFixed(2) + '万' : n.toLocaleString();
}

export function fmtSODate(dt: Date, hhmm: string = '00:00'): string {
  return dt.getFullYear() + '/' + (dt.getMonth() + 1) + '/' + dt.getDate() + ' ' + hhmm;
}

// Generate array of days centered at TODAY (-14 to +35)
export function generate29Days(today: Date = new Date()): DayInfo[] {
  const arr: DayInfo[] = [];
  for (let i = -14; i <= 35; i++) {
    const ds = ymd(addDays(today, i));
    arr.push({
      date: ds,
      md: fmtMD(ds),
      wd: weekdayOf(ds),
      doff: i,
      isToday: i === 0,
    });
  }
  return arr;
}

// Generate array of DayInfo for any custom [startDate, endDate] range
export function generateDateRange(startDateStr: string, endDateStr: string): DayInfo[] {
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');
  const today = new Date();
  const todayStr = ymd(today);
  const arr: DayInfo[] = [];

  const cur = new Date(start);
  while (cur <= end) {
    const ds = ymd(cur);
    const diffTime = cur.getTime() - new Date(todayStr + 'T00:00:00').getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    arr.push({
      date: ds,
      md: fmtMD(ds),
      wd: weekdayOf(ds),
      doff: diffDays,
      isToday: ds === todayStr,
    });
    cur.setDate(cur.getDate() + 1);
  }
  return arr;
}

