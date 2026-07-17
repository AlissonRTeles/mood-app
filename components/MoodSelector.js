import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { MOODS, getMoodColor, moodTextOn } from '../theme/theme';

// Linha de emoções do "Daily Mood Log".
export default function MoodSelector({ selected, onSelect }) {
  const { isDark } = useTheme();
  return (
    <View style={styles.row}>
      {MOODS.map((m) => {
        const active = selected === m.key;
        const color = getMoodColor(m, isDark ? 'dark' : 'light');
        const iconColor = moodTextOn(color);
        return (
          <TouchableOpacity
            key={m.key}
            onPress={() => onSelect({ ...m, color })}
            activeOpacity={0.8}
            accessibilityLabel={m.label}
            style={[
              styles.bubble,
              { backgroundColor: color },
              active && [
                styles.active,
                {
                  borderColor: isDark ? '#282A36' : '#FFFFFF',
                  shadowOpacity: isDark ? 0.5 : 0.15,
                },
              ],
            ]}
          >
            <MaterialCommunityIcons name={m.icon} size={26} color={iconColor} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  bubble: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  active: {
    borderWidth: 3,
    transform: [{ scale: 1.12 }],
    shadowColor: '#000', shadowRadius: 6, elevation: 4,
  },
});
