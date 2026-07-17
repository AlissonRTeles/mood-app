import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { radius } from '../theme/theme';
import Logo from '../components/Logo';
import Card from '../components/Card';

export default function PracticesScreen() {
  const { colors, font } = useTheme();
  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Logo width={96} />
          <View style={styles.search}>
            <Ionicons name="search" size={18} color={colors.text} />
          </View>
        </View>

        <Text style={[font.label, { marginTop: 12 }]}>Práticas</Text>
        <Text style={[font.h1, { marginTop: 6 }]}>
          Exercícios{'\n'}baseados nas <Text style={{ fontWeight: '800' }}>suas{'\n'}necessidades</Text>
        </Text>

        <View style={styles.grid}>
          <View style={styles.col}>
            <Card title={'Minhas forças\n& qualidades'} color={colors.lavender} textColor={colors.text} />
            <View style={{ height: 14 }} />
            <Card title={'Diversidade\n& inclusão'} color={colors.mint} textColor={colors.text} />
          </View>
          <View style={styles.col}>
            <Card title={'Construir\nconfiança'} color={colors.yellow} textColor={colors.text} />
            <View style={{ height: 14 }} />
            <Card title={'Ativação\ncomportamental'} color={colors.blush} textColor={colors.text} />
          </View>
        </View>

        <TouchableOpacity style={styles.wide} activeOpacity={0.9}>
          <Text style={styles.wideTitle}>Saúde mental{'\n'}em foco</Text>
          <View style={styles.arrowCircle}><Feather name="arrow-up-right" size={18} color={colors.text} /></View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgAlt },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 130 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  search: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', gap: 14, marginTop: 26 },
  col: { flex: 1 },
  wide: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 22, marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wideTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  arrowCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
});
