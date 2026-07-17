import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { radius, MOODS, moodByKey } from '../theme/theme';

const FAVORITES_KEY = '@mindmood:favorites';

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const { colors, font, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);

  const meta = user?.user_metadata || {};
  const fullName = meta.full_name || 'Visitante';
  const initial = fullName.charAt(0).toUpperCase();
  const email = user?.email || '—';
  const createdAt = user?.created_at ? new Date(user.created_at) : null;

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(fullName);
  const [saving, setSaving] = useState(false);

  const [favorites, setFavorites] = useState(meta.favorite_moods || []);

  const toggleFavorite = (key) => {
    setFavorites((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name.trim(), favorite_moods: favorites },
    });
    setSaving(false);
    if (error) {
      Alert.alert('Não foi possível salvar', error.message);
      return;
    }
    setEditing(false);
    Alert.alert('Perfil atualizado', 'Suas alterações foram salvas.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Topo: voltar + título */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityLabel="Voltar">
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Meu perfil</Text>
          <TouchableOpacity onPress={() => setEditing((v) => !v)} style={styles.editBtn}>
            <Text style={[styles.editText, { color: colors.text }]}>
              {editing ? 'Cancelar' : 'Editar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card principal */}
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          {editing ? (
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Seu nome"
              placeholderTextColor={colors.textMuted}
              style={styles.nameInput}
            />
          ) : (
            <Text style={styles.name}>{fullName}</Text>
          )}
          <Text style={styles.email}>{email}</Text>
          {createdAt && (
            <Text style={styles.memberSince}>
              Membro desde {createdAt.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </Text>
          )}
        </View>

        {/* Estatísticas rápidas */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
            <Text style={styles.statNum}>{favorites.length}</Text>
            <Text style={styles.statLbl}>Favoritos</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
            <Text style={styles.statNum}>—</Text>
            <Text style={styles.statLbl}>Registros</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
            <Text style={styles.statNum}>7</Text>
            <Text style={styles.statLbl}>Meta semanal</Text>
          </View>
        </View>

        {/* Emoções favoritas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emoções favoritas</Text>
          <Text style={styles.sectionHint}>
            {editing
              ? 'Toque para escolher até 3 emoções que mais combinam com você.'
              : 'As emoções que você mais usa no dia a dia.'}
          </Text>
          <View style={styles.moodGrid}>
            {MOODS.map((m) => {
              const selected = favorites.includes(m.key);
              return (
                <TouchableOpacity
                  key={m.key}
                  disabled={!editing}
                  activeOpacity={0.8}
                  onPress={() => toggleFavorite(m.key)}
                  style={[
                    styles.moodPill,
                    {
                      backgroundColor: selected ? m.color : colors.surfaceSoft,
                      borderColor: selected ? m.color : 'transparent',
                    },
                  ]}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      { color: selected ? (isDark ? '#282A36' : colors.text) : colors.text },
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Ações */}
        <View style={styles.actions}>
          {editing ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleSave}
              disabled={saving}
              style={[styles.primaryBtn, { backgroundColor: colors.dark, opacity: saving ? 0.7 : 1 }]}
            >
              <Text style={styles.primaryBtnText}>{saving ? 'Salvando…' : 'Salvar alterações'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setEditing(true)}
              style={[styles.primaryBtn, { backgroundColor: colors.dark }]}
            >
              <Text style={styles.primaryBtnText}>Editar perfil</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              Alert.alert('Sair da conta?', 'Você poderá entrar novamente a qualquer momento.', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', style: 'destructive', onPress: signOut },
              ])
            }
            style={[styles.secondaryBtn, { borderColor: colors.border }]}
          >
            <Text style={styles.secondaryBtnText}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors, isDark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingTop: 16, paddingBottom: 130 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  editBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: colors.surface },
  editText: { fontSize: 14, fontWeight: '700' },

  heroCard: {
    backgroundColor: isDark ? '#BD93F9' : colors.blush,
    borderRadius: radius.xl,
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: isDark ? '#282A36' : colors.surface,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: isDark ? '#BD93F9' : colors.text },
  name: { fontSize: 24, fontWeight: '800', color: isDark ? '#282A36' : colors.text, textAlign: 'center' },
  nameInput: {
    fontSize: 22, fontWeight: '800', color: isDark ? '#282A36' : colors.text,
    backgroundColor: isDark ? '#21222C' : colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 14, paddingVertical: 8, minWidth: 200, textAlign: 'center',
  },
  email: { fontSize: 14, color: isDark ? '#21222C' : colors.text, opacity: 0.7, marginTop: 6 },
  memberSince: { fontSize: 12, color: isDark ? '#21222C' : colors.text, opacity: 0.6, marginTop: 8, textTransform: 'capitalize' },

  statsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  statBox: { flex: 1, borderRadius: radius.lg, padding: 16, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '800', color: colors.text },
  statLbl: { fontSize: 12, color: colors.textMuted, marginTop: 4 },

  section: { marginTop: 26 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  sectionHint: { fontSize: 13, color: colors.textMuted, marginTop: 6, marginBottom: 14, lineHeight: 18 },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  moodPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 2,
  },
  moodEmoji: { fontSize: 18, marginRight: 8 },
  moodLabel: { fontSize: 14, fontWeight: '700' },

  actions: { marginTop: 28, gap: 12 },
  primaryBtn: { paddingVertical: 16, borderRadius: radius.pill, alignItems: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { paddingVertical: 16, borderRadius: radius.pill, alignItems: 'center', borderWidth: 1 },
  secondaryBtnText: { color: colors.text, fontSize: 15, fontWeight: '700' },
});
