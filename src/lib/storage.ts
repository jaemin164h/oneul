import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'oneul.settings.v1';
const HISTORY_KEY = 'oneul.history.v1';

export type Settings = {
  goal: number;
  strideCm: number;
};

export const defaultSettings: Settings = {
  goal: 10000,
  strideCm: 78,
};

export type HistoryMap = Record<string, number>;

export async function loadSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return defaultSettings;
  }
  try {
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings: Settings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function loadHistory(): Promise<HistoryMap> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as HistoryMap;
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
