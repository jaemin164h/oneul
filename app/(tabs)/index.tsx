import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../src/components/Card';
import { MetricTile } from '../../src/components/MetricTile';
import { Notice } from '../../src/components/Notice';
import { ProgressBar } from '../../src/components/ProgressBar';
import { Screen } from '../../src/components/Screen';
import { formatLongDate } from '../../src/lib/date';
import {
  formatKm,
  formatNumber,
  stepsToKcal,
  stepsToKm,
  stepsToMinutes,
} from '../../src/lib/metrics';
import { useWalk } from '../../src/lib/WalkContext';
import { colors, radii } from '../../src/theme';

export default function TodayScreen() {
  const { permission, requestPermission, settings, steps } = useWalk();
  const km = stepsToKm(steps, settings.strideCm);
  const minutes = stepsToMinutes(steps);
  const kcal = stepsToKcal(steps);
  const progress = settings.goal > 0 ? steps / settings.goal : 0;

  return (
    <Screen eyebrow={formatLongDate()} title="오늘">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {permission === 'denied' ? (
          <Notice
            title="동작 접근이 필요합니다"
            body="오늘의 걸음을 자동으로 세기 위해 동작 및 피트니스 권한을 허용해 주세요."
            action="허용하기"
            onPress={() => void requestPermission()}
          />
        ) : null}
        {permission === 'unavailable' ? (
          <Notice
            title="이 기기에서는 걸음을 셀 수 없습니다"
            body="실제 iPhone이나 Android에서 Expo Go로 열면 만보기가 동작합니다. 시뮬레이터는 센서가 없습니다."
          />
        ) : null}

        <Card style={styles.hero}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>걸음</Text>
          </View>
          <Text style={styles.steps}>{formatNumber(steps)}</Text>
          <Text style={styles.sub}>
            {formatNumber(settings.goal)} 목표 · {minutes}분
          </Text>
          <View style={styles.progressWrap}>
            <ProgressBar progress={progress} />
          </View>
        </Card>

        <View style={styles.row}>
          <MetricTile value={formatKm(km)} label="거리" />
          <MetricTile value={`${minutes}분`} label="시간" />
          <MetricTile value={`${formatNumber(kcal)}`} label="kcal" />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  hero: {
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  pill: {
    backgroundColor: colors.track,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    marginBottom: 14,
  },
  pillText: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  steps: {
    color: colors.label,
    fontSize: 64,
    fontWeight: '700',
    letterSpacing: -1.6,
    fontVariant: ['tabular-nums'],
  },
  sub: {
    marginTop: 6,
    color: colors.secondary,
    fontSize: 17,
    fontWeight: '500',
  },
  progressWrap: {
    width: '100%',
    marginTop: 22,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
});
