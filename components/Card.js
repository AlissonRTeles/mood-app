import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { radius } from '../theme/theme';

export default function Card({ title, color, onPress, style, children, textColor }) {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);
  const bg = color ?? colors.lavender;
  const labelColor = textColor ?? colors.text;
  const arrowBg = isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.4)';

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.card, { backgroundColor: bg }, style]}>
      <Text style={[styles.title, { color: labelColor }]}>{title}</Text>
      {children}
      <View style={styles.arrowWrap}>
        <View style={[styles.arrowCircle, { backgroundColor: arrowBg }]}>
          <Feather name="arrow-up-right" size={18} color={labelColor} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 160,
    borderRadius: radius.lg,
    padding: 18,
    justifyContent: 'space-between',
  },
  title: { fontSize: 18, fontWeight: '700' },
  arrowWrap: { alignItems: 'flex-end' },
  arrowCircle: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
});
