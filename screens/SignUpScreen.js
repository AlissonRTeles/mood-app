import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Logo from '../components/Logo';
import Field from '../components/Field';
import PrimaryButton from '../components/PrimaryButton';
import GoogleButton from '../components/GoogleButton';

export default function SignUpScreen({ navigation }) {
  const { signUp, signInWithGoogle } = useAuth();
  const { colors, font } = useTheme();
  const styles = makeStyles(colors);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handle = async () => {
    if (!email || !password) return Alert.alert('Preencha e-mail e senha');
    if (password.length < 6) return Alert.alert('A senha precisa de ao menos 6 caracteres');
    setLoading(true);
    const { data, error } = await signUp(email.trim(), password, name.trim());
    setLoading(false);
    if (error) return Alert.alert('Não foi possível cadastrar', error.message);
    if (!data.session) {
      Alert.alert('Confirme seu e-mail', 'Enviamos um link de confirmação para o seu e-mail.');
      navigation.navigate('SignIn');
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    setGoogleLoading(false);
    if (error) Alert.alert('Não foi possível continuar com o Google', error.message);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <Logo width={160} />
        <Text style={[font.label, { marginTop: 40 }]}>Vamos começar</Text>
        <Text style={[font.h1, { marginTop: 6 }]}>Crie sua{'\n'}conta</Text>

        <View style={{ marginTop: 30 }}>
          <Field placeholder="Nome" value={name} onChangeText={setName} />
          <Field placeholder="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <Field placeholder="Senha (mín. 6 caracteres)" secureTextEntry value={password} onChangeText={setPassword} />
          <PrimaryButton title="Cadastrar" onPress={handle} loading={loading} style={{ marginTop: 8 }} />
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>
          <GoogleButton onPress={handleGoogle} loading={googleLoading} />
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')} style={styles.link}>
            <Text style={font.label}>
              Já tem conta? <Text style={styles.linkStrong}>Entrar</Text>
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
