# Coding with Kesh — Admin Dashboard

Custom premium admin (React + TypeScript + Vite) — **not Django Admin**.
50 screens matching the full spec, wired to the Phase 1 backend API.

## Run locally

```bash
cp .env.example .env   # set VITE_API_BASE_URL to your backend
npm install
npm run dev             # http://localhost:5174
```

Requires the Phase 1 backend running (see /backend) with seed data loaded,
so Login has a real account: `admin@codingwithkesh.com` / `Admin@12345`.

## Structure

- `src/pages/` — one file per screen, 50 total, grouped by domain folder
- `src/components/` — shared UI kit (DataTable, Modal, Badge, StatCard,
  ResourceListPage, IntegrationConfigPage, status states)
- `src/layouts/` — AdminLayout (sidebar+topbar), AuthLayout, nav config
- `src/services/` — typed API client per resource (axios + JWT refresh)
- `src/store/` — zustand auth + UI state (persisted)
- `src/theme/` — design tokens + light/dark ThemeProvider (persists to
  localStorage, respects system preference)

## What's real vs. stubbed here

- Real: routing for all 50 screens, typed API layer, JWT auth incl.
  refresh, light/dark theme system, loading/empty/error states on every
  list screen, curriculum drag-ordering, quiz/course/entitlement flows,
  masked-secret config forms for every integration.
- Stubbed pending backend data: charts show live data once the backend
  is seeded and running; "Test Connection" / "Save" buttons call the
  real endpoints and will work as soon as the backend is up.
