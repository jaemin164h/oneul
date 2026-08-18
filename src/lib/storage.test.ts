import { describe, expect, it, jest } from '@jest/globals';

import {
  applySettingsUpdate,
  defaultSettings,
  normalizeHistory,
  normalizeSettings,
  pruneHistory,
} from './storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual(
    '@react-native-async-storage/async-storage/jest/async-storage-mock',
  ),
);

describe('storage normalization', () => {
  it('손상된 설정 값을 필드별 기본값으로 복구한다', () => {
    expect(normalizeSettings({ goal: '많이', strideCm: 70 })).toEqual({
      goal: defaultSettings.goal,
      strideCm: 70,
    });
    expect(normalizeSettings({ goal: -1, strideCm: 999 })).toEqual(
      defaultSettings,
    );
  });

  it('빠른 연속 설정 변경을 현재 값 기준으로 누적한다', () => {
    const once = applySettingsUpdate(defaultSettings, (current) => ({
      ...current,
      goal: current.goal + 500,
    }));
    const twice = applySettingsUpdate(once, (current) => ({
      ...current,
      goal: current.goal + 500,
    }));

    expect(twice.goal).toBe(11000);
  });

  it('유효한 날짜와 음이 아닌 정수 걸음만 유지한다', () => {
    expect(
      normalizeHistory({
        '2026-08-19': 4321,
        '2026-02-30': 100,
        tomorrow: 10,
        '2026-08-18': -1,
        '2026-08-17': Number.NaN,
      }),
    ).toEqual({ '2026-08-19': 4321 });
  });

  it('오늘을 포함한 최근 90일만 유지한다', () => {
    const today = new Date(2026, 7, 19);
    expect(
      pruneHistory(
        {
          '2026-05-21': 1,
          '2026-05-22': 2,
          '2026-08-19': 3,
          '2026-08-20': 4,
        },
        today,
      ),
    ).toEqual({
      '2026-05-22': 2,
      '2026-08-19': 3,
    });
  });
});
