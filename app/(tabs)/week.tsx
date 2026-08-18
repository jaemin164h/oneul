import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../src/components/Card';
import { Screen } from '../../src/components/Screen';
import { parseDateKey, weekdayLabel } from '../../src/lib/date';
import { formatNumber } from '../../src/lib/metrics';
import { useWalk } from '../../src/lib/WalkContext';
import { colors, radii } from '../../src/theme';

export default function WeekScreen() {
  const { settings, week } = useWalk();
  const total = week.reduce((sum, day) => sum + day.steps, 0);
  const average = Math.round(total / 7);
  const max = Math.max(settings.goal, ...week.map((day) => day.steps), 1);
  const hit = week.filter((day) => day.steps >= settings.goal).length;

  return (
    <Screen title="이번 주">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.summary}>
          <Text style={styles.total}>{formatNumber(total)}</Text>
          <Text style={styles.caption}>걸음 · 평균 {formatNumber(average)}</Text>
        </Card>

        <Card style={styles.chart}>
          <View style={styles.bars}>
            {week.map((day) => {
              const height = 18 + (day.steps / max) * 120;
              const reached = day.steps >= settings.goal;
              const weekday = weekdayLabel(parseDateKey(day.key));
              return (
                <View
                  accessible
                  accessibilityLabel={`${weekday}요일 ${formatNumber(day.steps)}걸음${reached ? ', 목표 달성' : ''}`}
                  key={day.key}
                  style={styles.barCol}
                >
                  <Text style={styles.barValue}>
                    {day.steps >= 1000
                      ? `${Math.round(day.steps / 100) / 10}k`
                      : day.steps || ''}
                  </Text>
                  <View
                    style={[
                      styles.bar,
                      {
                        height,
                        backgroundColor: reached ? colors.accent : colors.track,
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>
                    {weekday}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        <Card style={styles.goalCard}>
          <Text style={styles.goalTitle}>목표 달성</Text>
          <Text style={styles.goalValue}>{hit}/7일</Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  summary: {
    paddingVertical: 24,
    paddingHorizontal: 22,
    marginBottom: 12,
  },
  total: {
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -1,
    color: colors.label,
    fontVariant: ['tabular-nums'],
  },
  caption: {
    marginTop: 4,
    fontSize: 16,
    color: colors.secondary,
    fontWeight: '500',
  },
  chart: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginBottom: 12,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 180,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barValue: {
    fontSize: 10,
    color: colors.tertiary,
    marginBottom: 6,
    fontVariant: ['tabular-nums'],
  },
  bar: {
    width: 18,
    borderRadius: radii.pill,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
  },
  goalCard: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.label,
  },
  goalValue: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.accent,
  },
});
