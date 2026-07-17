import React, { createContext, useContext, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = (email, password, fullName) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

  const signOut = () => supabase.auth.signOut();

  const signInWithGoogle = async () => {
    const redirectTo = Linking.createURL('auth/callback');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) return { error };

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success') return { error: null, cancelled: true };

    const { params, errorCode } = QueryParams.getQueryParams(result.url);
    if (errorCode) return { error: new Error(errorCode) };

    const { access_token, refresh_token, code } = params;

    if (code) {
      return supabase.auth.exchangeCodeForSession(code);
    }
    if (access_token && refresh_token) {
      return supabase.auth.setSession({ access_token, refresh_token });
    }
    return { error: new Error('Não foi possível concluir o login com Google.') };
  };

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, loading, signIn, signUp, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
