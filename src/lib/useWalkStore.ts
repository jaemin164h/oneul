import { Pedometer } from 'expo-sensors';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { addDays, dateKey, startOfDay, startOfWeek } from './date';
import {
  type HistoryMap,
  type Settings,
  clearHistory as clearStoredHistory,
  defaultSettings,
  loadHistory,
  loadSettings,
  saveHistory,
  saveSettings,
} from './storage';

type PermissionState = 'unknown' | 'granted' | 'denied' | 'unavailable';

export function useWalkStore() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [steps, setSteps] = useState(0);
  const [history, setHistory] = useState<HistoryMap>({});
  const [permission, setPermission] = useState<PermissionState>('unknown');
  const [ready, setReady] = useState(false);
  const watchRef = useRef<{ remove(): void } | null>(null);
  const androidBaseRef = useRef(0);
  const stepsRef = useRef(0);
  const historyRef = useRef<HistoryMap>({});

  const persistToday = useCallback(async (value: number) => {
    const key = dateKey();
    const next = { ...historyRef.current, [key]: value };
    historyRef.current = next;
    setHistory(next);
    await saveHistory(next);
  }, []);

  const readTodayFromDevice = useCallback(async () => {
    try {
      const result = await Pedometer.getStepCountAsync(startOfDay(), new Date());
      return result.steps;
    } catch {
      return null;
    }
  }, []);

  const refresh = useCallback(async () => {
    const available = await Pedometer.isAvailableAsync();
    if (!available) {
      setPermission('unavailable');
      return;
    }

    const current = await Pedometer.getPermissionsAsync();
    if (current.status !== 'granted') {
      setPermission('denied');
      return;
    }

    setPermission('granted');
    const deviceSteps = await readTodayFromDevice();
    if (deviceSteps != null) {
      setSteps(deviceSteps);
      stepsRef.current = deviceSteps;
      await persistToday(deviceSteps);
    }
  }, [persistToday, readTodayFromDevice]);

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      const [storedSettings, storedHistory] = await Promise.all([
        loadSettings(),
        loadHistory(),
      ]);
      if (!mounted) {
        return;
      }

      setSettings(storedSettings);
      historyRef.current = storedHistory;
      setHistory(storedHistory);

      const todayStored = storedHistory[dateKey()] ?? 0;
      setSteps(todayStored);
      stepsRef.current = todayStored;
      androidBaseRef.current = todayStored;

      const available = await Pedometer.isAvailableAsync();
      if (!available) {
        setPermission('unavailable');
        setReady(true);
        return;
      }

      const existing = await Pedometer.getPermissionsAsync();
      if (existing.status === 'granted') {
        setPermission('granted');
        const deviceSteps = await readTodayFromDevice();
        if (deviceSteps != null && mounted) {
          setSteps(deviceSteps);
          stepsRef.current = deviceSteps;
          androidBaseRef.current = deviceSteps;
          await persistToday(deviceSteps);
        }
        watchRef.current = Pedometer.watchStepCount((result) => {
          const next =
            Platform.OS === 'ios'
              ? stepsRef.current
              : androidBaseRef.current + result.steps;
          if (Platform.OS === 'ios') {
            void readTodayFromDevice().then((value) => {
              if (value == null) {
                return;
              }
              stepsRef.current = value;
              setSteps(value);
              void persistToday(value);
            });
            return;
          }
          stepsRef.current = next;
          setSteps(next);
          void persistToday(next);
        });
      } else {
        setPermission('denied');
      }

      setReady(true);
    };

    void start();

    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refresh();
      }
    });

    return () => {
      mounted = false;
      appState.remove();
      watchRef.current?.remove();
    };
  }, [persistToday, readTodayFromDevice, refresh]);

  const requestPermission = useCallback(async () => {
    const available = await Pedometer.isAvailableAsync();
    if (!available) {
      setPermission('unavailable');
      return;
    }
    const result = await Pedometer.requestPermissionsAsync();
    if (result.status !== 'granted') {
      setPermission('denied');
      return;
    }
    setPermission('granted');
    await refresh();
    watchRef.current?.remove();
    androidBaseRef.current = stepsRef.current;
    watchRef.current = Pedometer.watchStepCount((watchResult) => {
      if (Platform.OS === 'ios') {
        void readTodayFromDevice().then((value) => {
          if (value == null) {
            return;
          }
          stepsRef.current = value;
          setSteps(value);
          void persistToday(value);
        });
        return;
      }
      const next = androidBaseRef.current + watchResult.steps;
      stepsRef.current = next;
      setSteps(next);
      void persistToday(next);
    });
  }, [persistToday, readTodayFromDevice, refresh]);

  const updateSettings = useCallback(async (partial: Partial<Settings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    await saveSettings(next);
  }, [settings]);

  const resetHistory = useCallback(async () => {
    await clearStoredHistory();
    const today = { [dateKey()]: stepsRef.current };
    historyRef.current = today;
    setHistory(today);
    await saveHistory(today);
  }, []);

  const weekKeys = Array.from({ length: 7 }, (_, index) =>
    dateKey(addDays(startOfWeek(), index)),
  );
  const week = weekKeys.map((key) => ({
    key,
    steps: key === dateKey() ? steps : history[key] ?? 0,
  }));

  const recent = Array.from({ length: 14 }, (_, index) => {
    const key = dateKey(addDays(new Date(), -index));
    return {
      key,
      steps: key === dateKey() ? steps : history[key] ?? 0,
    };
  });

  return {
    ready,
    permission,
    settings,
    steps,
    week,
    recent,
    requestPermission,
    updateSettings,
    resetHistory,
  };
}
