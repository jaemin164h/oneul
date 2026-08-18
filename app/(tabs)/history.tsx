import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../src/components/Card';
import { Screen } from '../../src/components/Screen';
import { formatLongDate, parseDateKey } from '../../src/lib/date';
import { formatNumber } from '../../src/lib/metrics';
import { useWalk } from '../../src/lib/WalkContext';
import { colors } from '../../src/theme';

export default function HistoryScreen() {
  const { recent, settings } = useWalk();

  return (
    <Screen title="기록">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.list}>
          {recent.map((day, index) => {
            const reached = day.steps >= settings.goal;
            return (
              <View key={day.key}>
                {index > 0 ? <View style={styles.separator} /> : null}
                <View style={styles.row}>
                  <View>
                    <Text style={styles.date}>
                      {formatLongDate(parseDateKey(day.key))}
                    </Text>
                    <Text style={styles.meta}>
                      목표 {formatNumber(settings.goal)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.steps,
                      reached ? styles.reached : null,
                    ]}
                  >
                    {formatNumber(day.steps)}
                  </Text>
                </View>
              </View>
            );
          })}
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
  list: {
    overflow: 'hidden',
  },
  row: {
    minHeight: 64,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.label,
  },
  meta: {
    marginTop: 3,
    fontSize: 13,
    color: colors.secondary,
  },
  steps: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.label,
    fontVariant: ['tabular-nums'],
  },
  reached: {
    color: colors.accent,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: 18,
  },
});
