import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { radius } from '../theme/theme';

export default function Field(props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      style={[styles.input, props.style]}
      {...props}
    />
  );
}

const makeStyles = (colors) => StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 22,
    paddingVertical: 18,
    fontSize: 16,
    color: colors.text,
    marginBottom: 14,
  },
});
