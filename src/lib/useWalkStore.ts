import { Pedometer } from 'expo-sensors';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { addDays, dateKey, startOfDay, startOfWeek } from './date';
import {
  applySettingsUpdate,
  type HistoryMap,
  type Settings,
  type SettingsUpdate,
  clearHistory as clearStoredHistory,
  defaultSettings,
  loadHistory,
  loadSettings,
  pruneHistory,
  saveHistory,
  saveSettings,
} from './storage';
import { calculateAndroidSteps, resolveIosSteps } from './walk';

type PermissionState = 'unknown' | 'granted' | 'denied' | 'unavailable';

export function useWalkStore() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [steps, setSteps] = useState(0);
  const [history, setHistory] = useState<HistoryMap>({});
  const [permission, setPermission] = useState<PermissionState>('unknown');
  const [canAskPermissionAgain, setCanAskPermissionAgain] = useState(true);
  const [historyStorageError, setHistoryStorageError] = useState(false);
  const [settingsStorageError, setSettingsStorageError] = useState(false);
  const [ready, setReady] = useState(false);
  const watchRef = useRef<{ remove(): void } | null>(null);
  const androidBaseRef = useRef(0);
  const androidOffsetRef = useRef(0);
  const androidLastSensorRef = useRef(0);
  const stepsRef = useRef(0);
  const historyRef = useRef<HistoryMap>({});
  const settingsRef = useRef<Settings>(defaultSettings);
  const activeDateRef = useRef(dateKey());
  const iosReadSequenceRef = useRef(0);
  const initializedRef = useRef(false);
  const mountedRef = useRef(true);
  const lifecycleRef = useRef(0);
  const historyWriteRef = useRef<Promise<void>>(Promise.resolve());
  const settingsWriteRef = useRef<Promise<void>>(Promise.resolve());

  const reportHistoryStorageError = useCallback(() => {
    if (mountedRef.current) {
      setHistoryStorageError(true);
    }
  }, []);

  const reportSettingsStorageError = useCallback(() => {
    if (mountedRef.current) {
      setSettingsStorageError(true);
    }
  }, []);

  const queueHistorySave = useCallback((value: HistoryMap) => {
    const snapshot = pruneHistory(value);
    historyWriteRef.current = historyWriteRef.current
      .catch(() => undefined)
      .then(() => saveHistory(snapshot))
      .then(() => {
        if (mountedRef.current) {
          setHistoryStorageError(false);
        }
      })
      .catch(reportHistoryStorageError);
    return historyWriteRef.current;
  }, [reportHistoryStorageError]);

  const queueSettingsSave = useCallback((value: Settings) => {
    settingsWriteRef.current = settingsWriteRef.current
      .catch(() => undefined)
      .then(() => saveSettings(value))
      .then(() => {
        if (mountedRef.current) {
          setSettingsStorageError(false);
        }
      })
      .catch(reportSettingsStorageError);
    return settingsWriteRef.current;
  }, [reportSettingsStorageError]);

  const persistSteps = useCallback((value: number, key = activeDateRef.current) => {
    const safeValue = Math.max(0, Math.round(value));
    const next = pruneHistory({ ...historyRef.current, [key]: safeValue });
    historyRef.current = next;
    stepsRef.current = safeValue;
    if (mountedRef.current) {
      setSteps(safeValue);
      setHistory(next);
    }
    void queueHistorySave(next);
  }, [queueHistorySave]);

  const readTodayFromDevice = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      return null;
    }
    try {
      const result = await Pedometer.getStepCountAsync(startOfDay(), new Date());
      return result.steps;
    } catch {
      return null;
    }
  }, []);

  const syncIosSteps = useCallback(async (replace = false) => {
    const requestDate = activeDateRef.current;
    const sequence = ++iosReadSequenceRef.current;
    const value = await readTodayFromDevice();
    if (
      value == null ||
      !mountedRef.current ||
      sequence !== iosReadSequenceRef.current ||
      requestDate !== activeDateRef.current
    ) {
      return;
    }
    persistSteps(
      resolveIosSteps(stepsRef.current, value, replace),
      requestDate,
    );
  }, [persistSteps, readTodayFromDevice]);

  const resetForNewDay = useCallback(() => {
    const today = dateKey();
    if (today === activeDateRef.current) {
      return false;
    }
    activeDateRef.current = today;
    iosReadSequenceRef.current += 1;
    androidBaseRef.current = 0;
    androidOffsetRef.current = 0;
    androidLastSensorRef.current = 0;
    stepsRef.current = 0;
    if (mountedRef.current) {
      setSteps(0);
    }
    return true;
  }, []);

  const startWatch = useCallback(() => {
    watchRef.current?.remove();
    watchRef.current = null;
    androidBaseRef.current = stepsRef.current;
    androidOffsetRef.current = 0;
    androidLastSensorRef.current = 0;

    watchRef.current = Pedometer.watchStepCount((result) => {
      if (!mountedRef.current) {
        return;
      }
      const previousSensorSteps = androidLastSensorRef.current;
      if (resetForNewDay()) {
        if (Platform.OS === 'ios') {
          void syncIosSteps(true);
        } else {
          androidOffsetRef.current = previousSensorSteps;
          androidLastSensorRef.current = result.steps;
          persistSteps(
            calculateAndroidSteps(0, result.steps, androidOffsetRef.current),
          );
        }
        return;
      }
      if (Platform.OS === 'ios') {
        void syncIosSteps();
        return;
      }
      androidLastSensorRef.current = result.steps;
      persistSteps(
        calculateAndroidSteps(
          androidBaseRef.current,
          result.steps,
          androidOffsetRef.current,
        ),
      );
    });
  }, [persistSteps, resetForNewDay, syncIosSteps]);

  const refresh = useCallback(async (restartWatch = true, replaceIos = false) => {
    try {
      const available = await Pedometer.isAvailableAsync();
      if (!mountedRef.current) {
        return;
      }
      if (!available) {
        watchRef.current?.remove();
        watchRef.current = null;
        setPermission('unavailable');
        return;
      }

      const current = await Pedometer.getPermissionsAsync();
      if (!mountedRef.current) {
        return;
      }
      setCanAskPermissionAgain(current.canAskAgain);
      if (current.status !== 'granted') {
        watchRef.current?.remove();
        watchRef.current = null;
        setPermission('denied');
        return;
      }

      setPermission('granted');
      const changedDay = resetForNewDay();
      if (Platform.OS === 'ios') {
        await syncIosSteps(changedDay || replaceIos);
      }
      if (mountedRef.current && restartWatch) {
        startWatch();
      }
    } catch {
      if (mountedRef.current) {
        setPermission('unavailable');
      }
    }
  }, [resetForNewDay, startWatch, syncIosSteps]);

  useEffect(() => {
    mountedRef.current = true;
    const lifecycle = ++lifecycleRef.current;

    const start = async () => {
      try {
        const [storedSettings, storedHistory] = await Promise.all([
          loadSettings(),
          loadHistory(),
        ]);
        if (!mountedRef.current || lifecycle !== lifecycleRef.current) {
          return;
        }

        settingsRef.current = storedSettings;
        setSettings(storedSettings);
        historyRef.current = storedHistory;
        setHistory(storedHistory);

        const today = dateKey();
        activeDateRef.current = today;
        const todayStored = storedHistory[today] ?? 0;
        setSteps(todayStored);
        stepsRef.current = todayStored;
        androidBaseRef.current = todayStored;

        initializedRef.current = true;
        await refresh(true, true);
      } finally {
        if (mountedRef.current && lifecycle === lifecycleRef.current) {
          setReady(true);
        }
      }
    };

    void start();

    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active' && initializedRef.current) {
        void refresh();
      }
    });
    const dayTimer = setInterval(() => {
      if (initializedRef.current && resetForNewDay()) {
        if (Platform.OS === 'ios') {
          void syncIosSteps(true);
        }
        startWatch();
      }
    }, 30_000);

    return () => {
      mountedRef.current = false;
      initializedRef.current = false;
      lifecycleRef.current += 1;
      appState.remove();
      clearInterval(dayTimer);
      watchRef.current?.remove();
      watchRef.current = null;
    };
  }, [refresh, resetForNewDay, startWatch, syncIosSteps]);

  const requestPermission = useCallback(async () => {
    try {
      const available = await Pedometer.isAvailableAsync();
      if (!available || !mountedRef.current) {
        if (mountedRef.current) {
          setPermission('unavailable');
        }
        return;
      }
      const result = await Pedometer.requestPermissionsAsync();
      if (!mountedRef.current) {
        return;
      }
      setCanAskPermissionAgain(result.canAskAgain);
      if (result.status !== 'granted') {
        setPermission('denied');
        return;
      }
      setPermission('granted');
      await refresh(true, true);
    } catch {
      if (mountedRef.current) {
        setPermission('unavailable');
      }
    }
  }, [refresh]);

  const updateSettings = useCallback((update: SettingsUpdate) => {
    const next = applySettingsUpdate(settingsRef.current, update);
    settingsRef.current = next;
    setSettings(next);
    return queueSettingsSave(next);
  }, [queueSettingsSave]);

  const resetHistory = useCallback(async () => {
    const today = { [activeDateRef.current]: stepsRef.current };
    historyRef.current = today;
    if (mountedRef.current) {
      setHistory(today);
    }
    historyWriteRef.current = historyWriteRef.current
      .catch(() => undefined)
      .then(async () => {
        await clearStoredHistory();
        await saveHistory(today);
      })
      .then(() => {
        if (mountedRef.current) {
          setHistoryStorageError(false);
        }
      })
      .catch(reportHistoryStorageError);
    await historyWriteRef.current;
  }, [reportHistoryStorageError]);

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
    canAskPermissionAgain,
    storageError: historyStorageError || settingsStorageError,
    settings,
    steps,
    week,
    recent,
    requestPermission,
    updateSettings,
    resetHistory,
  };
}
