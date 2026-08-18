const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function startOfDay(date = new Date()) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function startOfWeek(date = new Date()) {
  const next = startOfDay(date);
  const weekday = next.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  next.setDate(next.getDate() + mondayOffset);
  return next;
}

export function formatLongDate(date = new Date()) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS[date.getDay()]}요일`;
}

export function formatMonthTitle(date = new Date()) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function weekdayLabel(date: Date) {
  return WEEKDAYS[date.getDay()];
}
