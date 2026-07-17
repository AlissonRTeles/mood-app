import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { makeColors, makeFont, palette } from '../theme/theme';

const STORAGE_KEY = '@mindmood:theme';

const ThemeContext = createContext({
  scheme: 'light',
  colors: makeColors('light'),
  font: makeFont(makeColors('light')),
  toggle: () => {},
  setScheme: () => {},
});

export function ThemeProvider({ children }) {
  const systemScheme = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  const [scheme, setScheme] = useState(systemScheme);

  // Carrega a preferência salva na primeira vez
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark') setScheme(stored);
    });
  }, []);

  // Segue o tema do sistema se o usuário ainda não escolheu manualmente
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
        if (stored) return; // usuário já escolheu — não sobrescreve
        setScheme(colorScheme === 'dark' ? 'dark' : 'light');
      });
    });
    return () => sub.remove();
  }, []);

  const persist = useCallback((next) => {
    setScheme(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggle = useCallback(() => {
    setScheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(() => {
    const c = makeColors(scheme);
    return {
      scheme,
      isDark: scheme === 'dark',
      colors: c,
      palette: palette[scheme],
      font: makeFont(c),
      toggle,
      setScheme: persist,
    };
  }, [scheme, toggle, persist]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
