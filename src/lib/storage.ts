import AsyncStorage from '@react-native-async-storage/async-storage';

import { addDays, dateKey, parseDateKey } from './date';

const SETTINGS_KEY = 'oneul.settings.v1';
const HISTORY_KEY = 'oneul.history.v1';
const HISTORY_RETENTION_DAYS = 90;

export const settingsLimits = {
  goal: { min: 1000, max: 30000 },
  strideCm: { min: 50, max: 110 },
} as const;

export type Settings = {
  goal: number;
  strideCm: number;
};
export type SettingsUpdate =
  | Partial<Settings>
  | ((current: Settings) => Settings);

export const defaultSettings: Settings = {
  goal: 10000,
  strideCm: 78,
};

export type HistoryMap = Record<string, number>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validInteger(
  value: unknown,
  min: number,
  max = Number.MAX_SAFE_INTEGER,
): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max
  );
}

export function normalizeSettings(value: unknown): Settings {
  if (!isRecord(value)) {
    return defaultSettings;
  }

  return {
    goal: validInteger(
      value.goal,
      settingsLimits.goal.min,
      settingsLimits.goal.max,
    )
      ? value.goal
      : defaultSettings.goal,
    strideCm: validInteger(
      value.strideCm,
      settingsLimits.strideCm.min,
      settingsLimits.strideCm.max,
    )
      ? value.strideCm
      : defaultSettings.strideCm,
  };
}

export function applySettingsUpdate(
  current: Settings,
  update: SettingsUpdate,
): Settings {
  return normalizeSettings(
    typeof update === 'function'
      ? update(current)
      : { ...current, ...update },
  );
}

function isValidDateKey(key: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    return false;
  }
  const parsed = parseDateKey(key);
  return !Number.isNaN(parsed.getTime()) && dateKey(parsed) === key;
}

export function normalizeHistory(value: unknown): HistoryMap {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      ([key, steps]) => isValidDateKey(key) && validInteger(steps, 0),
    ),
  ) as HistoryMap;
}

export function pruneHistory(history: HistoryMap, today = new Date()): HistoryMap {
  const cutoff = dateKey(addDays(today, -(HISTORY_RETENTION_DAYS - 1)));
  const todayKey = dateKey(today);
  return Object.fromEntries(
    Object.entries(history).filter(([key]) => key >= cutoff && key <= todayKey),
  );
}

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return defaultSettings;
    }
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings: Settings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function loadHistory(): Promise<HistoryMap> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) {
      return {};
    }
    return pruneHistory(normalizeHistory(JSON.parse(raw)));
  } catch {
    return {};
  }
}

export async function saveHistory(history: HistoryMap) {
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export async function clearHistory() {
  await AsyncStorage.removeItem(HISTORY_KEY);
}
