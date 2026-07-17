# MindMood v2 — App de registro de emoções (Expo SDK 54 + Supabase)

App de registro de humor/emoções com **autenticação**, **persistência** no Supabase e
**design system dual-theme** (claro pastel + escuro Dracula), seguindo o mockup com
cards arredondados, tipografia generosa e barra inferior em pílula.

## Funcionalidades

- Cadastro e login com Supabase Auth (e-mail/senha, sessão persistida)
- Login com **Google** (OAuth via Supabase, fluxo PKCE)
- Reflexão diária + 6 emoções (Feliz, Calmo, Irritado, Animado, Ansioso, Cansado)
- Histórico dos últimos registros com **exclusão** (segurar no item)
- Progresso semanal automático (meta de 7 registros)
- Estatísticas: bolhas proporcionais por emoção + barras de satisfação
- **Tema claro/escuro** com toggle animado (mola) e paleta Dracula no dark
- **Tab bar** com pílula ativa que desliza entre os itens (mola + interpolação)
- **Drawer lateral** (botão ⚙) com perfil, metas, lembretes, exportação, privacidade, sobre
- **Tela de perfil** com edição de nome e emoções favoritas (persistido em `user_metadata`)
- Hook `useMoods` centraliza toda a persistência (insert/delete/agregações)
- Row Level Security: cada pessoa só acessa os próprios dados

## Estrutura

```
mood-app/
├── App.js                       # navegação (auth stack + tabs + profile) + drawer
├── app.json                     # userInterfaceStyle: automatic (segue o tema)
├── lib/supabase.js              # cliente Supabase (AsyncStorage)
├── lib/useMoods.js              # hook de persistência
├── contexts/AuthContext.js      # sessão + signIn/Up/Out + Google
├── contexts/ThemeContext.js     # light/dark + persistência AsyncStorage
├── theme/theme.js               # design system (light + Dracula dark)
├── components/                  # Card, MoodSelector, Logo, PrimaryButton, GoogleButton, Field
├── screens/                     # SignIn, SignUp, Home, Practices, Stats, Profile
├── images/logo.png              # logo BluDot
└── supabase/schema.sql          # tabelas + RLS + trigger de profile
```

## Como rodar

### 1. Supabase

1. Crie um projeto em https://supabase.com.
2. **SQL Editor** → cole e rode `supabase/schema.sql`.
3. **Project Settings → API** → copie `Project URL` e `anon public key`.
4. (Opcional, para testes) **Authentication → Providers → Email** → desative
   "Confirm email" para login imediato sem confirmação.

### 1.1 Login com Google

1. No **Google Cloud Console** → APIs & Services → Credentials → crie uma
   **OAuth client ID** do tipo *Web application*.
2. Em "Authorized redirect URIs" adicione a URL de callback do Supabase:
   `https://SEU-PROJETO.supabase.co/auth/v1/callback`.
3. No **Supabase** → Authentication → Providers → **Google** → ative e cole o
   `Client ID` e `Client Secret`.
4. Em Authentication → URL Configuration → **Redirect URLs**, adicione o
   esquema do app: `mindmood://auth/callback`.
5. Nenhuma configuração extra é necessária no app.

### 2. Variáveis de ambiente

```bash
cp .env.example .env
# preencha EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY
```

### 3. Instalar e iniciar

```bash
npm install
npx expo install @react-native-async-storage/async-storage react-native-screens \
  react-native-safe-area-context react-native-svg react-native-url-polyfill
npx expo start
```

Abra no **Expo Go** (QR code) ou emulador.

## Design system (theme/theme.js)

### Tema claro (pastel do mockup)

| Token      | Cor       |
|------------|-----------|
| bg         | `#EFDFD5` |
| bgAlt      | `#F3ECF1` |
| surface    | `#FFFFFF` |
| text       | `#1C1C1E` |
| textMuted  | `#9A9AA0` |
| lavender   | `#C8CBEC` |
| yellow     | `#EBC94A` |
| mint       | `#BCD6CD` |
| blush      | `#ECD9D0` |

### Tema escuro (Dracula)

| Token      | Cor       |
|------------|-----------|
| bg         | `#282A36` |
| bgAlt      | `#21222C` |
| surface    | `#343746` |
| surfaceSoft| `#44475A` |
| text       | `#F8F8F2` |
| textMuted  | `#6272A4` |
| purple     | `#BD93F9` |
| green      | `#50FA7B` |
| yellow     | `#F1FA8C` |
| pink       | `#FF79C6` |

A preferência do usuário é persistida em `AsyncStorage` (`@mindmood:theme`) e sobrescreve
o esquema do sistema. `app.json` está com `userInterfaceStyle: "automatic"`.

## Segurança

No app cliente use apenas a **anon key** (pública por design). A proteção real vem
das políticas de **RLS** do `schema.sql`. Nunca coloque a `service_role key` no app.
