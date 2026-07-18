// ============================================================
// Design system — light + dark, inspirado no mockup pastel
// ============================================================

export const palette = {
  // light
  light: {
    bg: '#EFDFD5',          // pêssego principal
    bgAlt: '#F3ECF1',       // lavanda clara (práticas/estatísticas)
    surface: '#FFFFFF',
    surfaceSoft: '#F7F1EC',
    border: '#E4DAD1',

    // cards de prática
    lavender: '#C8CBEC',
    yellow: '#EBC94A',
    mint: '#BCD6CD',
    blush: '#ECD9D0',

    // texto
    text: '#1C1C1E',
    textMuted: '#9A9AA0',
    textInverse: '#FFFFFF',

    // ações
    dark: '#1C1C1E',
    onDark: '#FFFFFF',

    statusBar: 'dark',
  },
  // dark — Dracula
  dark: {
    bg: '#282A36',          // background
    bgAlt: '#21222C',       // current line (telas secundárias)
    surface: '#343746',     // slightly lighter card surface
    surfaceSoft: '#44475A', // comment/selection
    border: '#44475A',

    // cards de prática — Dracula accents
    lavender: '#BD93F9',    // purple
    yellow: '#F1FA8C',      // yellow
    mint: '#50FA7B',        // green
    blush: '#FF79C6',       // pink

    // texto
    text: '#F8F8F2',        // foreground
    textMuted: '#6272A4',   // comment
    textInverse: '#282A36',

    // ações
    dark: '#F8F8F2',        // foreground como botão
    onDark: '#282A36',

    statusBar: 'light',
  },
};

// Helper: devolve o conjunto de cores do tema atual
export const makeColors = (scheme = 'light') => ({
  ...palette[scheme],
  // aliases de compatibilidade (componentes antigos)
  bg: palette[scheme].bg,
  bgAlt: palette[scheme].bgAlt,
  surface: palette[scheme].surface,
  surfaceSoft: palette[scheme].surfaceSoft,
  text: palette[scheme].text,
  textMuted: palette[scheme].textMuted,
  dark: palette[scheme].dark,
  lavender: palette[scheme].lavender,
  yellow: palette[scheme].yellow,
  mint: palette[scheme].mint,
  blush: palette[scheme].blush,

  // paleta de emoções (bolhas das estatísticas) — mantém tons próprios
  happiness: '#E4C94A',
  calm: '#7C9C6F',
  anger: '#D8715F',
  excitement: '#4E90D6',
  sadness: '#E7D3C9',
  stress: '#A2A6DC',
});

// Cores estáticas (fallback) — usadas em arquivos que ainda não usam o hook
export const colors = makeColors('light');

export const radius = { sm: 14, md: 22, lg: 30, xl: 40, pill: 999 };
export const spacing = (n) => n * 4;

export const makeFont = (c) => ({
  h1: { fontSize: 38, lineHeight: 44, fontWeight: '800', color: c.text },
  h2: { fontSize: 24, lineHeight: 30, fontWeight: '700', color: c.text },
  label: { fontSize: 15, color: c.textMuted, fontWeight: '500' },
  body: { fontSize: 16, color: c.text },
});

export const font = makeFont(colors);

// Paleta de emoções por tema — usada nas bolhas, pills e barras.
// Mantém a mesma chave por emoção, mas com cor otimizada para cada modo
// (light = pastel do mockup, dark = tons Dracula mais saturados/legíveis).
const MOOD_PALETTE = {
  light: {
    happy:   '#F2D65C',
    calm:    '#8FBF8A',
    angry:   '#D8715F',
    excited: '#4E90D6',
    anxious: '#E8C9BE',
    tired:   '#A2A6DC',
  },
  dark: {
    happy:   '#F1FA8C',
    calm:    '#50FA7B',
    angry:   '#FF5555',
    excited: '#8BE9FD',
    anxious: '#FF79C6',
    tired:   '#BD93F9',
  },
};

export const getMoodPalette = (scheme = 'light') => MOOD_PALETTE[scheme] ?? MOOD_PALETTE.light;

// Cor de texto (ícone/rótulo) sobre a bolha da emoção — sempre escura,
// para manter todas as bolhas consistentes (inclusive vermelho e azul).
export const moodTextOn = () => '#1C1C1E';

// Emoções do "Daily Mood Log" — chave gravada no banco
// `icon` é um nome de ícone do MaterialCommunityIcons (@expo/vector-icons)
// `colors` traz a paleta por tema (light/dark) — acessada via getMoodColor(m, scheme).
export const MOODS = [
  { key: 'happy',   label: 'Feliz',    icon: 'emoticon-happy-outline',   colors: { light: '#F2D65C', dark: '#F1FA8C' } },
  { key: 'calm',    label: 'Calmo',    icon: 'emoticon-neutral-outline', colors: { light: '#8FBF8A', dark: '#50FA7B' } },
  { key: 'angry',   label: 'Irritado', icon: 'emoticon-angry-outline',   colors: { light: '#D8715F', dark: '#FF5555' } },
  { key: 'excited', label: 'Animado',  icon: 'emoticon-excited-outline', colors: { light: '#4E90D6', dark: '#8BE9FD' } },
  { key: 'anxious', label: 'Ansioso',  icon: 'emoticon-frown-outline',   colors: { light: '#E8C9BE', dark: '#FF79C6' } },
  { key: 'tired',   label: 'Cansado',  icon: 'emoticon-sad-outline',     colors: { light: '#A2A6DC', dark: '#BD93F9' } },
];

// Devolve a cor do humor de acordo com o tema ativo. Aceita um objeto mood
// (com `colors`) ou uma chave (string) que será resolvida via moodByKey.
export const getMoodColor = (moodOrKey, scheme = 'light') => {
  const m = typeof moodOrKey === 'string' ? moodByKey[moodOrKey] : moodOrKey;
  if (!m) return scheme === 'dark' ? '#BD93F9' : '#A2A6DC';
  return m.colors?.[scheme] ?? m.color ?? (scheme === 'dark' ? '#BD93F9' : '#A2A6DC');
};

// `moodsFor(scheme)` devolve o array MOODS já com a cor do tema corrente (`color`).
export const moodsFor = (scheme = 'light') =>
  MOODS.map((m) => ({ ...m, color: getMoodColor(m, scheme) }));

export const moodByKey = Object.fromEntries(MOODS.map((m) => [m.key, m]));
