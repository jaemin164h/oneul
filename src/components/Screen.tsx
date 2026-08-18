import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../theme';

type Props = {
  eyebrow?: string;
  title: string;
  children: ReactNode;
};

export function Screen({ eyebrow, title, children }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  eyebrow: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  title: {
    color: colors.label,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
