# Coding with Kesh — Student Mobile App

React Native + TypeScript (Expo), all 52 student screens per spec, wired
to the Phase 1 backend API.

## Run locally

```bash
cp .env.example .env       # set EXPO_PUBLIC_API_BASE_URL
npm install
npm start                   # opens Expo dev tools — press a/i/w for Android/iOS/Web
```

Needs the Phase 1 backend running with seed data. Demo login:
`student1@example.com` / `Student@123`.

## Structure

- `src/screens/` — 52 screens across 12 domain folders (auth, home,
  courses, learning, study, assessment, progress, certification,
  gamification, community, account, advanced)
- `src/navigation/` — AuthNavigator (pre-login), MainTabs (bottom tabs:
  Home/Explore/My Learning/Community/Profile), RootNavigator (stack
  hosting everything else on top of the tabs)
- `src/components/` — Screen, Card, Button, Badge, CourseCard,
  ProgressBar, StatusStates (loading/empty/error/offline)
- `src/services/` — typed API client (axios + JWT refresh), one service
  file per domain
- `src/store/` — zustand: auth (tokens in SecureStore, not AsyncStorage),
  offline downloads metadata
- `src/theme/` — design tokens + ThemeProvider (system/light/dark,
  persisted, respects OS setting)

## Why Expo

The spec calls for "React Native, TypeScript, React Navigation." This
delivery uses Expo (managed workflow) rather than bare React Native CLI —
still genuine React Native, but without needing native Android/iOS
project folders to be hand-scaffolded and kept in sync, which isn't
practical to generate and verify in this environment. `npx expo prebuild`
converts it to a bare project with native folders at any time if that's
preferred for production.

## What's real vs. stubbed

- Real: navigation for all 52 screens, JWT auth with secure token storage,
  theme system, typed API layer, quiz-taking flow, checkout flow (calls
  the real create-order/verify-payment endpoints), community posts/likes/
  comments, notes (local), streak/achievements/roadmap display.
- Stubbed, with the real integration point already wired: video playback
  (signed URL is fetched for real; the native player itself is a
  placeholder — swap in `expo-av` or a CDN provider's RN SDK), PDF viewer
  (swap in `react-native-pdf`), source code viewer (swap in a syntax
  highlighter), payment gateway native checkout SDK, actual file downloads
  for Offline Manager (metadata/store is real, the byte-level download
  worker is not implemented).
