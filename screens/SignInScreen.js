import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Logo from '../components/Logo';
import Field from '../components/Field';
import PrimaryButton from '../components/PrimaryButton';
import GoogleButton from '../components/GoogleButton';

export default function SignInScreen({ navigation }) {
  const { signIn, signInWithGoogle } = useAuth();
  const { colors, font } = useTheme();
  const styles = makeStyles(colors);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handle = async () => {
    if (!email || !password) return Alert.alert('Preencha e-mail e senha');
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) Alert.alert('Não foi possível entrar', error.message);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    setGoogleLoading(false);
    if (error) Alert.alert('Não foi possível entrar com o Google', error.message);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <Logo width={160} />
        <Text style={[font.label, { marginTop: 40 }]}>Bem-vindo de volta</Text>
        <Text style={[font.h1, { marginTop: 6 }]}>Entre na{'\n'}sua conta</Text>

        <View style={{ marginTop: 36 }}>
          <Field placeholder="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <Field placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} />
          <PrimaryButton title="Entrar" onPress={handle} loading={loading} style={{ marginTop: 8 }} />
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>
          <GoogleButton onPress={handleGoogle} loading={googleLoading} />
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.link}>
            <Text style={font.label}>
              Não tem conta? <Text style={styles.linkStrong}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  link: { marginTop: 22, alignSelf: 'center' },
  linkStrong: { color: colors.text, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, color: colors.textMuted, fontSize: 13 },
});
