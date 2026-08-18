import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii } from '../theme';
import { Card } from './Card';

type Props = {
  title: string;
  body: string;
  action?: string;
  onPress?: () => void;
};

export function Notice({ title, body, action, onPress }: Props) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {action && onPress ? (
        <Pressable onPress={onPress} style={styles.button}>
          <Text style={styles.buttonText}>{action}</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.label,
    marginBottom: 6,
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.secondary,
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: 14,
    backgroundColor: colors.label,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
