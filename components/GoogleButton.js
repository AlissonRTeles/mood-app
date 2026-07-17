import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { radius } from '../theme/theme';

export default function GoogleButton({ onPress, loading, style }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={loading}
      style={[styles.btn, style, { backgroundColor: colors.surface, borderColor: colors.border }, loading && { opacity: 0.7 }]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <>
          <Text style={styles.icon}>G</Text>
          <Text style={[styles.txt, { color: colors.text }]}>Continuar com Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const makeStyles = (_colors) => StyleSheet.create({
  btn: {
    flexDirection: 'row',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  icon: { fontSize: 16, fontWeight: '800', color: '#4285F4' },
  txt: { fontSize: 16, fontWeight: '700' },
});
