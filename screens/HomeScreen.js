import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useMoods } from '../lib/useMoods';
import { radius, MOODS, moodByKey, getMoodColor, moodTextOn } from '../theme/theme';
import Logo from '../components/Logo';
import MoodSelector from '../components/MoodSelector';
import MoodToast from '../components/MoodToast';

const WEEKLY_GOAL = 7;

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const { colors, font, isDark } = useTheme();
  const styles = makeStyles(colors);
  const firstName = (user?.user_metadata?.full_name || 'você').split(' ')[0];

  const { items, loading, load, add, remove, weekCount } = useMoods(user?.id);
  const [reflection, setReflection] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toastKey, setToastKey] = useState(0);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const saveMood = async (mood) => {
    setSelectedMood(mood.key);
    setSaving(true);
    const { error } = await add({ emotion: mood.key, emoji: mood.icon, note: reflection.trim() });
    setSaving(false);
    if (error) return Alert.alert('Erro ao salvar', error.message);
    setReflection('');
    setToastKey((k) => k + 1);
  };

  const sendReflection = async () => {
    if (!reflection.trim()) return;
    if (!selectedMood) {
      return Alert.alert('Escolha uma emoção', 'Toque em um rostinho para registrar como você se sente.');
    }
    await saveMood(moodByKey[selectedMood]);
  };

  const confirmDelete = (id) =>
    Alert.alert('Excluir registro?', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => remove(id) },
    ]);

  const progress = Math.min(100, Math.round((weekCount / WEEKLY_GOAL) * 100));
  const recent = items.slice(0, 5);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {toastKey > 0 && <MoodToast key={toastKey} onHide={() => setToastKey(0)} />}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Logo width={96} />
          <TouchableOpacity onPress={signOut} style={styles.iconBtn} accessibilityLabel="Sair da conta">
            <Ionicons name="power" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Card de reflexão */}
        <View style={styles.reflectionCard}>
          <Text style={font.label}>Reflexão diária</Text>
          <Text style={styles.hello}>
            Olá, {firstName} <Ionicons name="leaf" size={20} color={colors.text} />{'\n'}Como você se sente sobre suas{' '}
            <Text style={{ fontWeight: '800' }}>emoções atuais?</Text>
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Sua reflexão.."
              placeholderTextColor={colors.textMuted}
              value={reflection}
              onChangeText={setReflection}
              multiline
            />
            <TouchableOpacity onPress={sendReflection} style={styles.sendBtn} accessibilityLabel="Enviar reflexão">
              <Feather name="arrow-up-right" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Mood Log */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Registro de humor</Text>
            {saving ? <ActivityIndicator size="small" color={colors.textMuted} /> : <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />}
          </View>
          <MoodSelector selected={selectedMood} onSelect={saveMood} />
          <Text style={styles.hint}>Toque em um rostinho para registrar sua emoção agora.</Text>
        </View>

        {/* Progresso */}
        <View style={styles.card}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Seu progresso</Text>
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
          </View>
          {loading ? (
            <ActivityIndicator color={colors.text} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.progressRow}>
              <Text style={styles.bigPct}>{progress}%</Text>
              <Text style={styles.progressLabel}>Do plano{'\n'}semanal concluído</Text>
            </View>
          )}
          <View style={[styles.track, { backgroundColor: isDark ? colors.surfaceSoft : '#F7F1EC' }]}>
            <View style={[styles.fill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.hint}>{weekCount} de {WEEKLY_GOAL} registros nesta semana</Text>
        </View>

        {/* Histórico recente */}
        {recent.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Últimos registros</Text>
            </View>
            {recent.map((r) => {
              const m = moodByKey[r.emotion];
              const mColor = m ? getMoodColor(m, isDark ? 'dark' : 'light') : colors.surfaceSoft;
              const iconColor = m ? moodTextOn(mColor) : colors.text;
              return (
                <TouchableOpacity key={r.id} onLongPress={() => confirmDelete(r.id)} style={styles.historyRow}>
                  <View style={[styles.historyEmoji, { backgroundColor: mColor }]}>
                    <MaterialCommunityIcons
                      name={m?.icon ?? 'emoticon-happy-outline'}
                      size={22}
                      color={iconColor}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.historyMood}>{m?.label ?? r.emotion}</Text>
                    {r.note ? <Text style={styles.historyNote} numberOfLines={1}>{r.note}</Text> : null}
                  </View>
                  <Text style={styles.historyDate}>
                    {new Date(r.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <Text style={styles.hint}>Segure em um item para excluí-lo.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 130 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  reflectionCard: { backgroundColor: colors.blush, borderRadius: radius.xl, padding: 22 },
  hello: { fontSize: 24, lineHeight: 30, fontWeight: '700', color: colors.text, marginTop: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.pill, marginTop: 20, paddingLeft: 20, paddingRight: 6, paddingVertical: 6 },
  input: { flex: 1, fontSize: 16, color: colors.text, maxHeight: 80 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  section: { marginTop: 26 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  hint: { color: colors.textMuted, fontSize: 13, marginTop: 12 },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 22, marginTop: 26 },
  progressRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  bigPct: { fontSize: 58, fontWeight: '800', color: colors.text },
  progressLabel: { color: colors.textMuted, fontSize: 14, textAlign: 'right', marginBottom: 10 },
  track: { height: 10, borderRadius: 5, marginTop: 16, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5, backgroundColor: colors.calm },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  historyEmoji: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  historyMood: { fontSize: 15, fontWeight: '700', color: colors.text },
  historyNote: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  historyDate: { fontSize: 13, color: colors.textMuted },
});
