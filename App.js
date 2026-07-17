import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { radius } from './theme/theme';

import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import PracticesScreen from './screens/PracticesScreen';
import StatsScreen from './screens/StatsScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ThemeToggleButton() {
  const { isDark, toggle } = useTheme();
  const slide = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  const TRACK_W = 96;
  const KNOB = 40;
  const RANGE = TRACK_W - KNOB - 3; // knob descansa a 3px de cada borda

  useEffect(() => {
    Animated.spring(slide, {
      toValue: isDark ? 1 : 0,
      useNativeDriver: true,
      friction: 7,
      tension: 80,
    }).start();
  }, [isDark, slide]);

  return (
    <TouchableOpacity
      onPress={toggle}
      activeOpacity={0.9}
      accessibilityLabel="Alternar tema"
      style={[styles.themeBtn, { width: TRACK_W, height: 44, borderRadius: 22 }]}
    >
      <View style={[styles.themeTrack, { width: TRACK_W, backgroundColor: isDark ? '#44475A' : '#F2E6DC' }]}>
        <Animated.View
          style={[
            styles.themeKnob,
            {
              width: KNOB, height: KNOB, borderRadius: KNOB / 2,
              backgroundColor: isDark ? '#BD93F9' : '#1C1C1E',
              transform: [
                {
                  translateX: slide.interpolate({
                    inputRange: [0, 1],
                    outputRange: [3, RANGE],
                  }),
                },
              ],
            },
          ]}
        />
        <View style={styles.themeIconRow} pointerEvents="none">
          <View style={[styles.themeIconSlot, { width: KNOB }]}>
            <Ionicons name="moon" size={16} color={isDark ? '#F8F8F2' : '#F4F2EE'} />
          </View>
          <View style={[styles.themeIconSlot, { width: KNOB }]}>
            <Ionicons name="sunny" size={16} color={isDark ? '#282A36' : '#9A9AA0'} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function CogButton({ onPress, colors }) {
  const spin = useRef(new Animated.Value(0)).current;
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() =>
        Animated.timing(spin, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => {
          spin.setValue(0);
        })
      }
      activeOpacity={0.85}
      accessibilityLabel="Abrir menu"
      style={[styles.cogBtn, { backgroundColor: colors.surface }]}
    >
      <Animated.View
        style={{
          transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) }],
        }}
      >
        <Ionicons name="settings-sharp" size={20} color={colors.text} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const DRAWER_ITEMS = [
  { key: 'profile',   icon: 'person-outline',             label: 'Meu perfil', route: 'Profile' },
  { key: 'goals',     icon: 'flag-outline',               label: 'Metas semanais' },
  { key: 'reminders', icon: 'notifications-outline',      label: 'Lembretes' },
  { key: 'export',    icon: 'download-outline',           label: 'Exportar dados' },
  { key: 'privacy',   icon: 'lock-closed-outline',        label: 'Privacidade' },
  { key: 'about',     icon: 'information-circle-outline', label: 'Sobre o MindMood' },
];

function AppDrawer({ visible, onClose, onNavigate }) {
  const { colors, isDark } = useTheme();
  const { user, signOut } = useAuth();
  const { width } = Dimensions.get('window');
  const DRAWER_W = Math.min(320, Math.round(width * 0.82));
  const translateX = useRef(new Animated.Value(DRAWER_W)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const [active, setActive] = useState(null);
  const signOutPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: visible ? 0 : DRAWER_W,
        useNativeDriver: true,
        friction: 9,
        tension: 70,
      }),
      Animated.timing(fade, {
        toValue: visible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, translateX, fade, DRAWER_W]);

  const handleClose = () => {
    setActive(null);
    onClose();
  };

  const handleItem = (item) => {
    setActive(item.key);
    if (item.route) {
      onNavigate?.(item.route);
    } else {
      handleClose();
    }
  };

  if (!visible) {
    return (
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.drawerBackdrop, { opacity: 0 }]}
      />
    );
  }

  const initial = (user?.user_metadata?.full_name || 'M').charAt(0).toUpperCase();
  const fullName = user?.user_metadata?.full_name || 'Visitante';
  const email = user?.email || '—';
  const activeBg = isDark ? '#BD93F9' : '#1C1C1E';
  const activeIconBg = isDark ? '#282A36' : '#BD93F9';
  const activeFg = '#FFFFFF';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.drawerBackdrop, { opacity: fade }]}
      >
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_W,
            backgroundColor: isDark ? '#21222C' : colors.surface,
            borderColor: colors.border,
            transform: [{ translateX }],
          },
        ]}
      >
        {/* Header do drawer */}
        <View style={[styles.drawerHeader, { borderBottomColor: colors.border }]}>
          <View style={[styles.drawerAvatar, { backgroundColor: isDark ? '#BD93F9' : colors.blush }]}>
            <Text style={[styles.drawerAvatarText, { color: isDark ? '#282A36' : colors.text }]}>{initial}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.drawerName, { color: colors.text }]} numberOfLines={1}>{fullName}</Text>
            <Text style={[styles.drawerEmail, { color: colors.textMuted }]} numberOfLines={1}>{email}</Text>
          </View>
        </View>

        {/* Itens */}
        <View style={styles.drawerList}>
          {DRAWER_ITEMS.map((it) => {
            const isActive = active === it.key;
            return (
              <TouchableOpacity
                key={it.key}
                activeOpacity={0.9}
                onPress={() => handleItem(it)}
                style={styles.drawerItemTouch}
              >
                <Animated.View
                  style={[
                    styles.drawerItem,
                    {
                      backgroundColor: isActive ? activeBg : 'transparent',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.drawerItemIcon,
                      { backgroundColor: isActive ? activeIconBg : colors.surfaceSoft },
                    ]}
                  >
                    <Ionicons
                      name={it.icon}
                      size={18}
                      color={isActive ? activeFg : colors.text}
                    />
                  </View>
                  <Text
                    style={[
                      styles.drawerItemLabel,
                      { color: isActive ? activeFg : colors.text },
                    ]}
                  >
                    {it.label}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={isActive ? activeFg : colors.textMuted}
                  />
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Botão de deslogar logo abaixo do último item */}
        <View style={styles.drawerSignOutWrap}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={() =>
              Animated.spring(signOutPulse, {
                toValue: 1,
                useNativeDriver: true,
                friction: 7,
                tension: 80,
              }).start()
            }
            onPress={signOut}
            style={styles.drawerSignOutTouch}
          >
            <Animated.View
              style={[
                styles.drawerSignOut,
                {
                  backgroundColor: isDark ? '#44475A' : '#1C1C1E',
                  transform: [
                    {
                      scale: signOutPulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.04],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons name="power" size={18} color="#FFFFFF" />
              <Text style={styles.drawerSignOutText}>Sair da conta</Text>
            </Animated.View>
          </TouchableOpacity>
          <Text style={[styles.drawerVersion, { color: colors.textMuted }]}>MindMood · v2.0.0</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const TABS = [
  { name: 'Home', icon: 'home-outline', iconActive: 'home' },
  { name: 'Practices', icon: 'grid-outline', iconActive: 'grid' },
  { name: 'Stats', icon: 'pie-chart-outline', iconActive: 'pie-chart' },
];

function AnimatedTabBar({ state, descriptors, navigation }) {
  const { colors, isDark } = useTheme();
  const [layout, setLayout] = useState({ width: 0, pad: 0, count: TABS.length });
  const slide = useRef(new Animated.Value(state.index)).current;

  useEffect(() => {
    Animated.spring(slide, {
      toValue: state.index,
      useNativeDriver: true,
      friction: 7,
      tension: 80,
    }).start();
  }, [state.index, slide]);

  const innerWidth = Math.max(0, layout.width - layout.pad * 2);
  const tabWidth = innerWidth > 0 ? innerWidth / layout.count : 0;
  const bubbleSize = 52;

  return (
    <View
      onLayout={(e) => {
        const { width } = e.nativeEvent.layout;
        setLayout((prev) =>
          prev.width === width ? prev : { width, pad: 10, count: TABS.length },
        );
      }}
      style={[styles.tabBar, { backgroundColor: colors.surface, shadowOpacity: isDark ? 0.4 : 0.12 }]}
    >
      {tabWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: (72 - bubbleSize) / 2,
            left: layout.pad,
            width: tabWidth,
            alignItems: 'center',
            transform: [
              {
                translateX: slide.interpolate({
                  inputRange: TABS.map((_, i) => i),
                  outputRange: TABS.map((_, i) => i * tabWidth),
                }),
              },
            ],
          }}
        >
          <View
            style={{
              width: bubbleSize, height: bubbleSize, borderRadius: bubbleSize / 2,
              backgroundColor: colors.dark,
            }}
          />
        </Animated.View>
      )}

      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        const tab = TABS[index];
        const iconName = (focused ? tab?.iconActive : tab?.icon) ?? 'ellipse';
        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.85}
            onPress={onPress}
            style={styles.tabBtn}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
          >
            <Ionicons name={iconName} size={20} color={focused ? colors.onDark : colors.text} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MainTabs({ onOpenDrawer, onNavigateProfile }) {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerTitle: '',
        headerLeft: () => <CogButton onPress={onOpenDrawer} colors={colors} />,
        headerRight: () => <ThemeToggleButton />,
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <AnimatedTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} listeners={{ tabPress: onNavigateProfile ? () => {} : undefined }} />
      <Tab.Screen name="Practices" component={PracticesScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
    </Tab.Navigator>
  );
}

function AuthedNavigator({ onOpenDrawer }) {
  const { session } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs">
        {() => <MainTabs onOpenDrawer={onOpenDrawer} />}
      </Stack.Screen>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function Root() {
  const { session, loading } = useAuth();
  const { colors, isDark } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navRef = React.useRef(null);

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.bg,
        card: colors.bg,
        text: colors.text,
        border: colors.border,
        primary: colors.dark,
      },
    };
  }, [colors, isDark]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <NavigationContainer ref={navRef} theme={navTheme}>
        {session ? (
          <AuthedNavigator onOpenDrawer={() => setDrawerOpen(true)} />
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
      <AppDrawer
        visible={session ? drawerOpen : false}
        onClose={() => setDrawerOpen(false)}
        onNavigate={(routeName) => {
          setDrawerOpen(false);
          navRef.current?.navigate(routeName);
        }}
      />
    </View>
  );
}

function ThemedApp() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AuthProvider>
        <Root />
      </AuthProvider>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  themeBtn: {
    marginRight: 12,
    justifyContent: 'center',
  },
  themeTrack: {
    height: 44, borderRadius: 22,
    justifyContent: 'center', overflow: 'hidden',
  },
  themeKnob: {
    position: 'absolute',
    top: 2, left: 0,
  },
  themeIconRow: {
    position: 'absolute', left: 3, right: 3, top: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  themeIconSlot: { alignItems: 'center', justifyContent: 'center' },
  cogBtn: {
    width: 44, height: 44, borderRadius: 22,
    marginLeft: 12,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  tabBar: {
    position: 'absolute',
    left: 20, right: 20, bottom: 24,
    height: 72,
    borderRadius: radius.pill,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  tabBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 52 },

  // Drawer
  drawerBackdrop: { backgroundColor: 'rgba(0,0,0,0.45)' },
  drawer: {
    position: 'absolute', top: 0, bottom: 0, right: 0,
    borderTopLeftRadius: radius.xl, borderBottomLeftRadius: radius.xl,
    borderWidth: 1,
    paddingTop: 60, paddingBottom: 24,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 24, shadowOffset: { width: -6, height: 0 },
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 20,
    borderBottomWidth: 1,
  },
  drawerAvatar: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
  },
  drawerAvatarText: { fontSize: 22, fontWeight: '800' },
  drawerName: { fontSize: 17, fontWeight: '700' },
  drawerEmail: { fontSize: 13, marginTop: 2 },
  drawerList: { flex: 1, paddingTop: 12, paddingHorizontal: 12 },
  drawerItemTouch: { borderRadius: radius.md, marginBottom: 4 },
  drawerItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 12,
    borderRadius: radius.md,
    overflow: 'visible',
  },
  drawerItemIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'visible',
  },
  drawerItemLabel: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '600' },
  drawerSignOutWrap: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  drawerSignOutTouch: { borderRadius: radius.pill },
  drawerSignOut: {
    flexDirection: 'row',
    paddingVertical: 14, paddingHorizontal: 20, borderRadius: radius.pill,
    alignItems: 'center', justifyContent: 'center',
    gap: 10,
  },
  drawerSignOutText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  drawerVersion: { textAlign: 'center', fontSize: 12, marginTop: 12 },
});
