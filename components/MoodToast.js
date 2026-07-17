import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { MOODS, getMoodColor, radius } from '../theme/theme';

const PIECES = 22;
const DURATION_VISIBLE = 2200;

function ConfettiPiece({ index, scheme }) {
  const progress = useRef(new Animated.Value(0)).current;
  const cfg = useRef({
    color: getMoodColor(MOODS[index % MOODS.length], scheme),
    dx: (Math.random() - 0.5) * 260,
    peak: -(20 + Math.random() * 50),
    dy: 70 + Math.random() * 100,
    rot: (Math.random() - 0.5) * 900,
    size: 6 + Math.random() * 5,
    delay: Math.random() * 150,
    duration: 900 + Math.random() * 600,
  }).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: cfg.duration,
      delay: cfg.delay,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [progress, cfg]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: cfg.size,
        height: cfg.size * 0.6,
        borderRadius: 2,
        backgroundColor: cfg.color,
        opacity: progress.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
        transform: [
          { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, cfg.dx] }) },
          { translateY: progress.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, cfg.peak, cfg.dy] }) },
          { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${cfg.rot}deg`] }) },
        ],
      }}
    />
  );
}

// Toast de confirmação com explosão de confete. Monta, anima e chama onHide ao fim.
export default function MoodToast({ message = 'Humor registrado!', onHide }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;
  const onHideRef = useRef(onHide);
  onHideRef.current = onHide;

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 7, tension: 90 }).start();
    const t = setTimeout(() => {
      Animated.timing(anim, { toValue: 0, duration: 220, useNativeDriver: true }).start(
        ({ finished }) => finished && onHideRef.current?.(),
      );
    }, DURATION_VISIBLE);
    return () => clearTimeout(t);
  }, [anim]);

  return (
    <View style={[styles.wrap, { top: insets.top + 14 }]} pointerEvents="none">
      <View style={styles.confettiOrigin}>
        {Array.from({ length: PIECES }, (_, i) => (
          <ConfettiPiece key={i} index={i} scheme={isDark ? 'dark' : 'light'} />
        ))}
      </View>
      <Animated.View
        style={[
          styles.toast,
          {
            backgroundColor: colors.surface,
            shadowOpacity: isDark ? 0.4 : 0.15,
            opacity: anim,
            transform: [
              { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) },
              { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
            ],
          },
        ]}
      >
        <Ionicons name="checkmark-circle" size={20} color={isDark ? '#50FA7B' : '#7C9C6F'} />
        <Text style={[styles.text, { color: colors.text }]}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0, right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  confettiOrigin: {
    position: 'absolute',
    top: 24, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    shadowColor: '#000',
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  text: { fontSize: 15, fontWeight: '700' },
});
