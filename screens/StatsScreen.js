import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useMoods } from '../lib/useMoods';
import { radius, moodByKey, getMoodColor, moodTextOn } from '../theme/theme';
import Logo from '../components/Logo';

export default function StatsScreen() {
  const { user } = useAuth();
  const { colors, font, isDark } = useTheme();
  const styles = makeStyles(colors);
  const { loading, load, counts, total } = useMoods(user?.id);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const scheme = isDark ? 'dark' : 'light';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Logo width={96} />
        </View>

        <Text style={[font.label, { marginTop: 12 }]}>Estatísticas</Text>
        <Text style={[font.h1, { marginTop: 6 }]}>
          Baseado nos <Text style={{ fontWeight: '800' }}>seus{'\n'}registros</Text>
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.text} style={{ marginTop: 60 }} />
        ) : total === 0 ? (
          <Text style={[font.label, { marginTop: 40 }]}>
            Ainda não há registros. Registre seu humor na tela inicial <Ionicons name="leaf" size={15} color={colors.textMuted} />
          </Text>
        ) : (
          <>
            {/* Bolhas proporcionais, como no 4º frame do mockup */}
            <View style={styles.bubbleArea}>
              {entries.map(([mood, n]) => {
                const size = 64 + (n / total) * 110;
                const m = moodByKey[mood];
                const mColor = m ? getMoodColor(m, scheme) : colors.surfaceSoft;
                return (
                  <View
                    key={mood}
                    style={[styles.bubble, {
                      width: size, height: size, borderRadius: size / 2,
                      backgroundColor: mColor,
                    }]}
                  >
                    <Text style={[styles.bubbleLabel, { color: moodTextOn(mColor) }]}>{m?.label ?? mood}</Text>
                    <Text style={[styles.bubbleN, { color: moodTextOn(mColor) }]}>{n}</Text>
                  </View>
                );
              })}
            </View>

            {/* Satisfação — barras por emoção */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Satisfação</Text>
              <Text style={font.label}>Baseado no registro diário de humor</Text>
              {entries.map(([mood, n]) => {
                const m = moodByKey[mood];
                const pct = Math.round((n / total) * 100);
                const mColor = m ? getMoodColor(m, scheme) : colors.surfaceSoft;
                return (
                  <View key={mood} style={styles.barRow}>
                    <Text style={styles.barLabel}>{m?.label ?? mood}</Text>
                    <View style={[styles.barTrack, { backgroundColor: colors.surfaceSoft }]}>
                      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: mColor }]} />
                    </View>
                    <Text style={styles.barPct}>{pct}%</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgAlt },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 130 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bubbleArea: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 30, alignItems: 'center' },
  bubble: { alignItems: 'center', justifyContent: 'center', padding: 8 },
  bubbleLabel: { color: colors.text, fontWeight: '700', fontSize: 13, textAlign: 'center' },
  bubbleN: { color: colors.text, fontSize: 12, opacity: 0.7 },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 22, marginTop: 26 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  barRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  barLabel: { width: 74, fontSize: 13, color: colors.text },
  barTrack: { flex: 1, height: 10, borderRadius: 5, overflow: 'hidden', marginHorizontal: 10 },
  barFill: { height: 10, borderRadius: 5 },
  barPct: { width: 42, textAlign: 'right', fontSize: 13, color: colors.textMuted },
});
