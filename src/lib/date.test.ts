import { describe, expect, it } from '@jest/globals';

import {
  addDays,
  dateKey,
  parseDateKey,
  startOfWeek,
  weekdayLabel,
} from './date';

describe('date helpers', () => {
  it('날짜 키를 로컬 날짜로 왕복 변환한다', () => {
    const date = new Date(2026, 7, 19, 23, 30);

    expect(dateKey(date)).toBe('2026-08-19');
    expect(dateKey(parseDateKey('2026-08-19'))).toBe('2026-08-19');
  });

  it('주의 시작일을 월요일로 계산한다', () => {
    expect(dateKey(startOfWeek(new Date(2026, 7, 19)))).toBe('2026-08-17');
    expect(dateKey(startOfWeek(new Date(2026, 7, 23)))).toBe('2026-08-17');
  });

  it('월 경계를 넘어 날짜를 더한다', () => {
    expect(dateKey(addDays(new Date(2026, 7, 31), 1))).toBe('2026-09-01');
    expect(weekdayLabel(new Date(2026, 7, 17))).toBe('월');
  });
});
