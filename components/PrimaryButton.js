import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { radius } from '../theme/theme';

export default function PrimaryButton({ title, onPress, loading, style }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={loading}
      style={[styles.btn, style, loading && { opacity: 0.7 }]}
    >
      {loading
        ? <ActivityIndicator color={colors.onDark} />
        : <Text style={styles.txt}>{title}</Text>}
    </TouchableOpacity>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  btn: {
    backgroundColor: colors.dark,
    borderRadius: radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txt: { color: colors.onDark, fontSize: 17, fontWeight: '700' },
});
