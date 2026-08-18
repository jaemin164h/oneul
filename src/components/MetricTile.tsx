import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, shadow } from '../theme';

type Props = {
  value: string;
  label: string;
};

export function MetricTile({ value, label }: Props) {
  return (
    <View style={styles.tile}>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.tile,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    ...shadow,
  },
  value: {
    color: colors.label,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    fontVariant: ['tabular-nums'],
  },
  label: {
    marginTop: 6,
    color: colors.secondary,
    fontSize: 13,
    fontWeight: '500',
  },
});
