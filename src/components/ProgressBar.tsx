import { StyleSheet, View } from 'react-native';

import { colors } from '../theme';

type Props = {
  progress: number;
};

export function ProgressBar({ progress }: Props) {
  const ratio = Math.max(0, Math.min(progress, 1));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="일일 걸음 목표 진행률"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(ratio * 100),
      }}
      style={styles.track}
    >
      <View
        style={[
          styles.fill,
          { width: `${Math.round(ratio * 100)}%` as `${number}%` },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 100,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 100,
    backgroundColor: colors.accent,
  },
});
