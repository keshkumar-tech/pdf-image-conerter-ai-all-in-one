<div align="center">

# ⚡ NoteFlow AI — All-in-One

**AI study-notes generator + 24 PDF/Image tools + a full Learning-Management “Library” stack** — all served from a single Express server.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Django](https://img.shields.io/badge/Django-5.0-092E20?logo=django&logoColor=white)](https://djangoproject.com)
[![Expo](https://img.shields.io/badge/Expo-Web-000020?logo=expo&logoColor=white)](https://expo.dev)
[![Gemini](https://img.shields.io/badge/Google-Gemini%20AI-4285F4?logo=google&logoColor=white)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-green)](#-license)

[Features](#-features) · [Architecture](#-architecture) · [Quick start](#-quick-start) · [Environment](#-environment-variables) · [Scripts](#-npm-scripts) · [API](#-api-reference) · [Library stack](#-library-stack) · [Deployment](#-deployment)

</div>

---

## 📖 Overview

Ever finished a 2-hour YouTube lecture and had nothing but a messy transcript? **NoteFlow AI** turns any educational video into structured, exam-ready study material — chapter-wise notes, formula sheets, flashcards, MCQs, and a printable PDF — in a few minutes.

The same app also ships **24 utility tools** (merge/split/compress/convert PDFs and images) and a **complete CBC learning portal** (Django REST backend + admin dashboard + student app), all mounted under one origin so a single deploy serves everything.

> **Demo credentials (after seeding):** library admin `admin@codingwithkesh.com / Admin@12345` · demo student `student1@example.com / Student@123`

---

## ✨ Features

### 🎥 YouTube → Notes pipeline

- **Analyze** any `youtube.com/watch`, `youtu.be` or `/shorts/` URL
- Fetch **metadata + captions** automatically; fall back to **pasting/uploading an SRT or transcript** when captions are disabled
- **Semantic chunking** — splits the lecture at topic boundaries, not fixed token windows, before sending to the model
- **Streamed job progress** — live stage + percentage while notes are generated
- **Multi-depth output** — Complete / Detailed / Concise
- **Multi-language** output (auto-detect or forced)
- **Chapter-wise notes** with timestamps, **math formula rendering** (KaTeX), and **PDF export** with multiple themes (Academic / Modern / Minimal)

### 🧠 Study tools

- **“Ask about this video”** AI chat, grounded in the notes + transcript with timestamp citations
- **MCQ generator** and **flashcard generator** per video
- **Study Hub** with progress tracking, bookmarks and saved state
- **Notes editor** — inline editing, section expansion, autosaved

### 🛠️ 24 PDF & Image tools

| Organize     | Optimize     | Convert to PDF    | Convert from PDF  | Edit             |
| ------------ | ------------ | ----------------- | ----------------- | ---------------- |
| Merge PDF    | Compress PDF | Word to PDF       | PDF to Word       | Rotate PDF       |
| Split PDF    | Repair PDF   | PowerPoint to PDF | PDF to PowerPoint | Add Page Numbers |
| Remove Pages | OCR PDF      | Excel to PDF      | PDF to Excel      | Add Watermark    |
| Organize PDF |              | JPG to PDF        | PDF to JPG        |                  |
| Scan to PDF  |              | HTML to PDF       | PDF to PDF/A      |                  |

Uploads are processed **in memory** with `multer` — nothing is written to disk.

### 🔐 Auth & dashboard

- Email/password **register + login**, plus **Google** and **GitHub** sign-in (with a real GitHub OAuth code-exchange callback)
- **User library / dashboard** — every analyzed video, its note status, topic count and PDF theme
- **Admin dashboard** — job metrics, provider config, system logs
- **Light/dark theme** with system preference detection

### 📚 Library / LMS stack

- **Django REST Framework backend** — JWT auth, courses, curriculum, quizzes, certificates, payments, community, notifications, analytics, support tickets
- **React admin dashboard** — 50 screens, typed API client, masked integration secrets
- **Expo student app** — runs on web / Android / iOS with hot reload

---

## 🏗 Architecture

```
┌───────────────────────────────────────────── NoteFlow Express server (:3000) ─────────────────────────────────────────────┐
│                                                                                                                            │
│   /                     /tools/*            /library                /library/admin/*           /library/school/*            │
│   React SPA (Vite)      PDF & image tools   Library landing         Admin dashboard (React)    Student app (Expo Web)      │
│   YouTube → Notes           │                    │                        │                              │                 │
│                             ▼                    ▼                        ▼                              ▼                 │
│   /api/videos/*  ──►  AI Provider  ◄──  /api/tools/*  ── pdf-lib / mammoth / xlsx / adm-zip      proxy → Expo :8081        │
│   /api/auth/*            (Gemini)                                                                 (dev only)               │
│   /api/jobs/*                                                                                                              │
└────────────────────────────────────────────────────────────────────────────┬───────────────────────────────────────────────┘
                                                                             │  REST + JWT
                                                                             ▼
                                                    ┌─────────────── Django REST backend (:8000) ───────────────┐
                                                    │  auth · users · courses · learning · payments ·           │
                                                    │  certificates · community · notifications · analytics ·   │
                                                    │  integrations · support · content                         │
                                                    └──────────── MySQL / Postgres / SQLite ────────────────────┘
```

### Tech stack

| Layer       | Technology                                                                                               |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| Frontend    | React 19, TypeScript, Vite 6, Tailwind CSS 4, `motion`, `lucide-react`                                   |
| Server      | Node.js, Express 4, `tsx` (dev), `esbuild` (prod bundle)                                                 |
| AI          | Google Gemini via `@google/genai` (provider abstraction in `server/services/aiProvider.ts`)              |
| PDF / docs  | `pdf-lib`, `pdfjs-dist`, `pdf-to-img`, `jspdf`, `html2canvas`, `pptxgenjs`, `mammoth`, `xlsx`, `adm-zip` |
| Math        | `katex`                                                                                                  |
| LMS backend | Django 5.0, Django REST Framework, SimpleJWT, Celery, Redis                                              |
| Student app | Expo (React Native Web)                                                                                  |
| Admin app   | React + Vite + Zustand                                                                                   |

### Project structure

```
.
├── server.ts                        # Express entry: API routes, sub-app mounts, Vite middleware
├── server/
│   ├── services/
│   │   ├── aiProvider.ts            # Gemini calls: notes, chat, MCQs, flashcards
│   │   ├── chunkingService.ts       # Semantic transcript chunking
│   │   └── youtubeService.ts        # Video ID parsing, metadata, captions
│   └── storage/db.ts                # In-memory store (videos, notes, jobs, users, logs)
├── src/
│   ├── App.tsx, main.tsx            # SPA entry & routing
│   ├── components/                  # Navbar, Workspace, NotesViewer, ToolsHome, tool pages…
│   ├── context/                     # AuthContext, ThemeContext
│   ├── services/                    # api.ts (typed client), pdfGenerator.ts
│   ├── utils/                       # mathRenderer, studyState, youtube helpers
│   └── library/                     # ── LMS stack ──
│       ├── cbc-backend/             #   Django REST API
│       ├── cbc-admin-dashboard/     #   React admin (50 screens)
│       └── cbc-student-dashboard/   #   Expo student app
├── public/library/                  # Built static bundles for admin & school apps
├── scripts/dev-all.ps1              # Starts all three servers in separate windows
└── vite.config.ts, tsconfig.json
```

---

## 🚀 Quick start

### Prerequisites

| Requirement | Version                    | Needed for                 |
| ----------- | -------------------------- | -------------------------- |
| Node.js     | ≥ 20 (LTS)                 | Site + admin + student web |
| Python      | ≥ 3.11                     | Django library backend     |
| MySQL       | 8.x (or Postgres / SQLite) | Library backend DB         |
| Redis       | optional                   | Caching / Celery           |

### 1. Clone & install

```bash
git clone https://github.com/keshkumar-tech/pdf-image-conerter-ai-all-in-one.git
cd pdf-image-conerter-ai-all-in-one
npm install
```

### 2. Configure environment

```bash
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux
```

Open `.env` and set at minimum `GEMINI_API_KEY`. See [Environment variables](#-environment-variables).

### 3. Run

```bash
npm run dev                   # → http://localhost:3000
```

That's it for the NoteFlow app. For the **full LMS stack**, see [Library stack](#-library-stack).

### 4. (Optional) Production build

```bash
npm run build                 # vite build + esbuild server bundle → dist/
NODE_ENV=production npm start # npm run start on Windows
```

---

## 🔑 Environment variables

| Variable                                    | Required | Description                                                                                  |
| ------------------------------------------- | :------: | -------------------------------------------------------------------------------------------- |
| `GEMINI_API_KEY`                            |    ✅    | Google Gemini API key — powers notes, chat, MCQs, flashcards                                 |
| `AI_PROVIDER`                               |    —     | Provider selector, default `gemini` (abstraction supports `gemini` / `openai` / `anthropic`) |
| `APP_URL`                                   |    —     | Public URL of the deployment — used for self-referential links and OAuth callbacks           |
| `YOUTUBE_API_KEY`                           |    —     | YouTube Data API v3 key — richer metadata; falls back to public oEmbed without it            |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` |    —     | Enables the GitHub OAuth token-exchange callback                                             |
| `LIBRARY_JWT_SECRET`                        |    —     | Signs library portal JWTs. **Change in production** (dev fallback exists)                    |
| `STUDENT_DEV_SERVER`                        |    —     | Expo dev server URL proxied under `/library/school`, default `http://127.0.0.1:8081`         |
| `DISABLE_HMR`                               |    —     | Set `true` to disable Vite HMR/file-watching                                                 |

> ⚠️ **Never commit `.env`.** It is ignored by `.gitignore`; only `.env.example` is tracked. Rotate any key that has ever been pushed to a public repo.

---

## 📜 npm scripts

| Script                  | What it does                                             |
| ----------------------- | -------------------------------------------------------- |
| `npm run dev`           | Start Express + Vite middleware with HMR on `:3000`      |
| `npm run build`         | Build the SPA and bundle the server to `dist/server.cjs` |
| `npm start`             | Run the production server bundle                         |
| `npm run preview`       | Preview the built Vite output                            |
| `npm run lint`          | `tsc --noEmit` — full type check                         |
| `npm run dev:backend`   | Django dev server on `127.0.0.1:8000`                    |
| `npm run dev:student`   | Expo web dev server on `:8081`                           |
| `npm run build:admin`   | Build admin app → `public/library/admin`                 |
| `npm run build:student` | Export student web app → `public/library/school`         |
| `npm run clean`         | Remove `dist/` and `server.js`                           |

**Start the whole Library stack** (backend + student + NoteFlow) in three windows:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\dev-all.ps1
```

---

## 🔌 API reference

All endpoints are served by the Express app. Errors return `{ "error": "message" }`.

### System

| Method | Route                | Description                                      |
| ------ | -------------------- | ------------------------------------------------ |
| `GET`  | `/api/health`        | Service status, Gemini config check, video count |
| `GET`  | `/api/debug/state`   | In-memory jobs, notes, transcripts, users, logs  |
| `GET`  | `/api/admin/metrics` | Counts, recent jobs, logs, provider config       |

### Auth

| Method | Route                       | Description                                                  |
| ------ | --------------------------- | ------------------------------------------------------------ |
| `POST` | `/api/auth/register`        | `{ name, email, password }` → `{ user, token }`              |
| `POST` | `/api/auth/login`           | `{ email, password }` → `{ user, token }`                    |
| `POST` | `/api/auth/google`          | `{ email, name, avatar }` → login or create                  |
| `POST` | `/api/auth/github`          | `{ email, name, avatar }` → login or create                  |
| `POST` | `/api/auth/github/callback` | `{ code, redirectUri }` → OAuth exchange → `{ user, token }` |
| `GET`  | `/api/auth/me`              | `Authorization: Bearer <token>` → current user               |

### Video → Notes pipeline

| Method  | Route                                  | Description                                                    |
| ------- | -------------------------------------- | -------------------------------------------------------------- |
| `POST`  | `/api/videos/analyze`                  | `{ url }` → metadata, transcript segment count, caption status |
| `POST`  | `/api/videos/source/upload-transcript` | `{ videoId, rawText, format }` → parse SRT/plain text          |
| `POST`  | `/api/videos/process`                  | `{ videoId, depth, language, pdfTheme }` → `{ jobId }`         |
| `GET`   | `/api/jobs/:id`                        | Job status, progress %, current stage                          |
| `GET`   | `/api/videos/:id`                      | Video metadata                                                 |
| `GET`   | `/api/videos/:id/transcript`           | Timestamped segments                                           |
| `GET`   | `/api/videos/:id/notes`                | Generated notes                                                |
| `PATCH` | `/api/notes/:videoId`                  | Update notes (editing, bookmarks)                              |
| `POST`  | `/api/videos/:id/chat`                 | `{ question, sourceOnly }` → answer + cited timestamps         |
| `POST`  | `/api/videos/:id/study-tools`          | `{ type: "mcqs" \| "flashcards" }`                             |
| `GET`   | `/api/user/library`                    | Dashboard: all videos with note status                         |

### Tools (all `multipart/form-data`)

| Method | Route                          | Input                                       |
| ------ | ------------------------------ | ------------------------------------------- |
| `POST` | `/api/tools/merge-pdf`         | `files[]` (≥ 2) → merged PDF                |
| `POST` | `/api/tools/split-pdf`         | `file` → ZIP of single-page PDFs            |
| `POST` | `/api/tools/remove-pages`      | `file`, `pages` (e.g. `1,3,5`)              |
| `POST` | `/api/tools/organize-pdf`      | `file`, `order` (e.g. `3,1,2`)              |
| `POST` | `/api/tools/scan-to-pdf`       | `files[]` (images)                          |
| `POST` | `/api/tools/compress-pdf`      | `file`                                      |
| `POST` | `/api/tools/repair-pdf`        | `file`                                      |
| `POST` | `/api/tools/ocr-pdf`           | `file`                                      |
| `POST` | `/api/tools/jpg-to-pdf`        | `files[]`                                   |
| `POST` | `/api/tools/pdf-to-jpg`        | `file` → ZIP                                |
| `POST` | `/api/tools/word-to-pdf`       | `file` (`.docx`)                            |
| `POST` | `/api/tools/excel-to-pdf`      | `file` (`.xlsx`)                            |
| `POST` | `/api/tools/powerpoint-to-pdf` | `file` (client-side conversion recommended) |
| `POST` | `/api/tools/html-to-pdf`       | `file` (`.html`)                            |
| `POST` | `/api/tools/pdf-to-word`       | `file`                                      |
| `POST` | `/api/tools/pdf-to-powerpoint` | `file`                                      |
| `POST` | `/api/tools/pdf-to-excel`      | `file`                                      |

**Example**

```bash
curl -X POST http://localhost:3000/api/videos/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

---

## 📚 Library stack

### Backend — Django REST (`src/library/cbc-backend`)

```bash
cd src/library/cbc-backend
python -m venv venv
venv\Scripts\activate              # Windows  (source venv/bin/activate on *nix)
pip install -r requirements.txt

# configure DB (defaults to MySQL; sqlite/postgres supported)
copy .env.example .env
python manage.py migrate

# demo data (idempotent — safe to re-run)
python manage.py seed_demo_data     # roles, admin user, class categories, courses, pricing
python manage.py seed_content       # study material / PYQ content
python manage.py seed_quizzes       # quizzes + questions

python manage.py runserver 127.0.0.1:8000
```

- API base: `http://127.0.0.1:8000/api/v1/` (health: `/api/v1/health/`)
- Auth: SimpleJWT (`/api/v1/auth/`)
- Apps: `users`, `courses`, `learning`, `payments`, `certificates`, `community`, `notifications`, `analytics`, `integrations`, `support`, `content`
- DB engines: `mysql` (default), `sqlite` (`DB_ENGINE=sqlite`), or `DATABASE_URL` for Postgres/Render
- `django-admin/` is kept for internal use only — the product admin is the React app

### Admin dashboard — React (`src/library/cbc-admin-dashboard`)

```bash
cd src/library/cbc-admin-dashboard
copy .env.example .env             # set VITE_API_BASE_URL
npm install
npm run dev                        # http://localhost:5174
```

50 screens with a typed Axios API client, JWT refresh, light/dark themes, loading/empty/error states, and masked-secret integration forms.

### Student app — Expo (`src/library/cbc-student-dashboard`)

```bash
cd src/library/cbc-student-dashboard
npm install
npm run web                        # http://localhost:8081
npm run android | npm run ios      # native
npm run web:export                 # static export
```

When running the main site, `/library/school/*` is **proxied to the Expo dev server** automatically, with asset URLs rewritten to the sub-path.

### URLs (via `npm run dev`)

| App               | URL                                   |
| ----------------- | ------------------------------------- |
| NoteFlow site     | http://localhost:3000                 |
| PDF & image tools | http://localhost:3000/tools           |
| Library landing   | http://localhost:3000/library         |
| Library admin     | http://localhost:3000/library/admin/  |
| Student app       | http://localhost:3000/library/school/ |
| Django API        | http://127.0.0.1:8000/api/v1/         |

---

## 🚢 Deployment

**Single-server (recommended)** — build once, serve everything from Express:

```bash
npm run build:admin       # build admin app → public/library/admin (scripts dev-all / vite build)
npm run build:student     # Expo web export → public/library/school
npm run build             # → dist/
npm start
```

Then set `NODE_ENV=production`, `PORT`, and your env vars on the host (Render, Railway, Fly.io, VPS, etc.). Static sub-apps are discovered from `public/library/<name>` at runtime, so a rebuilt bundle is picked up without code changes.

**Checklist**

- [ ] `GEMINI_API_KEY` set (never exposed to the client)
- [ ] `LIBRARY_JWT_SECRET` set to a strong random value
- [ ] `NODE_ENV=production` so Vite dev middleware is skipped
- [ ] Backend `DATABASE_URL` / `DB_ENGINE` configured; `python manage.py migrate` run
- [ ] `CORS_ALLOWED_ORIGINS` includes the deployed admin origin
- [ ] OAuth redirect URIs updated to the production `APP_URL`

---

## 🤝 Contributing

1. Fork the repo and create a branch: `git checkout -b feat/my-feature`
2. Make your change and run `npm run lint`
3. Commit (`feat: …` / `fix: …` / `docs: …`) and open a pull request

---

## 🧯 Troubleshooting

| Symptom                                    | Fix                                                                                      |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `geminiConfigured: false` on `/api/health` | `GEMINI_API_KEY` missing or still the placeholder                                        |
| “Transcript unavailable” for a video       | Captions disabled — paste or upload the transcript manually                              |
| `/library/school` shows 502                | Expo not running on `:8081`; start it or use the built bundle in `public/library/school` |
| Django `No module named mysqlclient`       | Install MySQL client libs, or run with `DB_ENGINE=sqlite`                                |
| CORS errors from admin app                 | Add the origin to `CORS_ALLOWED_ORIGINS`                                                 |
| `npm run lint` fails                       | Run `npm install` again — types come from a clean dependency tree                        |

---

## 📄 License

Released under the **MIT License**. See [LICENSE](LICENSE).

<div align="center">

**Built with ☕ by [Coding with Kesh](https://github.com/keshkumar-tech)**

⭐ Star the repo if NoteFlow saved you a night of note-taking.

</div>
