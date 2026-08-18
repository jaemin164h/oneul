import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Card } from '../../src/components/Card';
import { Screen } from '../../src/components/Screen';
import { formatNumber } from '../../src/lib/metrics';
import { useWalk } from '../../src/lib/WalkContext';
import { colors } from '../../src/theme';

function StepperRow({
  label,
  value,
  onMinus,
  onPlus,
}: {
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable onPress={onMinus} style={styles.stepBtn} hitSlop={8}>
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>
        <Text style={styles.value}>{value}</Text>
        <Pressable onPress={onPlus} style={styles.stepBtn} hitSlop={8}>
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { settings, updateSettings, resetHistory } = useWalk();
  const [busy, setBusy] = useState(false);

  const confirmReset = () => {
    Alert.alert('기록을 지울까요?', '오늘 걸음 수는 유지되고, 지난 기록만 삭제됩니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          setBusy(true);
          void resetHistory().finally(() => setBusy(false));
        },
      },
    ]);
  };

  return (
    <Screen title="설정">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.group}>
          <StepperRow
            label="일일 목표"
            value={formatNumber(settings.goal)}
            onMinus={() =>
              void updateSettings({
                goal: Math.max(1000, settings.goal - 500),
              })
            }
            onPlus={() =>
              void updateSettings({
                goal: Math.min(30000, settings.goal + 500),
              })
            }
          />
          <View style={styles.separator} />
          <StepperRow
            label="보폭"
            value={`${settings.strideCm} cm`}
            onMinus={() =>
              void updateSettings({
                strideCm: Math.max(50, settings.strideCm - 1),
              })
            }
            onPlus={() =>
              void updateSettings({
                strideCm: Math.min(110, settings.strideCm + 1),
              })
            }
          />
        </Card>

        <Card style={styles.group}>
          <Pressable onPress={confirmReset} disabled={busy} style={styles.row}>
            <Text style={styles.destructive}>기록 지우기</Text>
          </Pressable>
        </Card>

        <Text style={styles.footnote}>
          거리와 열량은 걸음 수와 보폭으로 추정합니다. iPhone에서는 오늘 0시부터의
          걸음을 읽고, Android에서는 앱이 켜져 있는 동안 누적합니다.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  group: {
    overflow: 'hidden',
    marginBottom: 12,
  },
  row: {
    minHeight: 52,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 17,
    color: colors.label,
  },
  value: {
    minWidth: 84,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: colors.label,
    fontVariant: ['tabular-nums'],
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.track,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 18,
    color: colors.label,
    fontWeight: '600',
    marginTop: -1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: 18,
  },
  destructive: {
    fontSize: 17,
    color: colors.destructive,
  },
  footnote: {
    marginTop: 8,
    paddingHorizontal: 8,
    fontSize: 13,
    lineHeight: 18,
    color: colors.secondary,
  },
});
