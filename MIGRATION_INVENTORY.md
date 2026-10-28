# MIGRATION INVENTORY

**Purpose:** Step 0 deliverable. Documents both apps before any code is written, so the
integration approach can be agreed. No files were modified to produce this.

- **Target (existing site):** `c:\6-noteflow-ai` — "NoteFlow AI"
- **Reference (READ-ONLY):** `C:\3-concept-builder-classes-app` — "Coding with Kesh" /
  "Concept Builder Classes" EdTech platform

---

## 1. TARGET APP — `c:\6-noteflow-ai` (NoteFlow AI)

### 1.1 Tech stack

| Layer       | Technology                                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
| Frontend    | React 19, TypeScript, Vite 6                                                                               |
| Router      | `react-router-dom` v7 (`BrowserRouter` + `<Routes>`)                                                       |
| Styling     | Tailwind CSS v4 (`@tailwindcss/vite`), CSS custom-property theme tokens (`--cf-*`)                         |
| Icons       | `lucide-react`                                                                                             |
| Math        | `katex` (own `MathFormula.tsx`)                                                                            |
| Backend     | Node/Express single file `server.ts` (also boots Vite in middleware mode)                                  |
| Storage     | **In-memory only** — `server/storage/db.ts` (`InMemoryDatabase` class, seeded demo data). **No database.** |
| Auth (site) | Custom, token `tok_<userId>_<ts>`, users held in memory. **Not used by Library.**                          |
| PDF/Docs    | `pdf-lib`, `jspdf`, `mammoth`, `xlsx`, `pptxgenjs`, `html2canvas`, `pdf-to-img`, `pdfjs-dist`, `adm-zip`   |
| AI          | `@google/genai` (Gemini)                                                                                   |
| Scripts     | `dev` = `tsx server.ts` (port **3000**), `build`, `lint` = `tsc --noEmit`                                  |

> Note: `npm`/`node` are **not on PATH** in this environment. Working invocation is
> `& 'C:\Program Files\nodejs\npm.cmd' run <script>` with
> `$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH`.

### 1.2 Routing (`src/App.tsx`)

| Route            | Element                                                  |
| ---------------- | -------------------------------------------------------- |
| `/`              | `ToolsHome` (PDF tools library landing)                  |
| `/tools/:toolId` | `GenericToolPageWrapper` → `GenericToolPage`             |
| `/youtube-notes` | `YouTubeInputHero` + `PipelineProgress`                  |
| `/workspace`     | `Workspace` (guarded: redirects `/` unless notes loaded) |
| **`/library`**   | **`DashboardView`** ← the "Library" menu target          |
| `/admin`         | `AdminDashboard`                                         |
| `*`              | redirect `/`                                             |

Header = `Navbar` → `TopNav.tsx`. The **"Library"** link in `TopNav.tsx` (line ~423)
navigates to `/library`.

### 1.3 What "Library" is today

`src/components/DashboardView.tsx` (160 lines) — a **flat read-only list** of AI-generated
study documents:

- Pulls `api.getLibrary()` → `GET /api/user/library` → `{ totalVideos, totalNotes, items[] }`
- Two stat pills (Processed Videos, Study Chapters), a search box, a 3-col card grid
  (thumbnail, title, channel, topic count, theme, "Open Notes" / "PDF Slides" buttons).
- **No login, no classes, no courses, no quizzes, no admin.** This is the entire Library
  surface that will be REPLACED.

### 1.4 Theme system

- `ThemeContext` toggles `.dark` on `<html>`; tokens are `--cf-*` in `src/index.css`
  (`:root` = light, `.dark` = dark overrides). Any new Library UI **must** use these tokens
  to stay consistent with header/footer and to work in dark mode.
- Design language: soft "aurora" gradient backgrounds (`.cf-vibe-bg`, `.cf-aurora-bg`),
  `glass` / `glass-card` surfaces, rainbow accent bar (`.cf-rainbow-bar`), fuchsia→cyan accents.

### 1.5 Integration surface available

- `server.ts` already mounts arbitrary REST routes under `/api/*` → an easy place to add a
  Library sub-API (or to proxy/embed the reference backend).
- Frontend is a normal Vite SPA → new routes/components drop into `src/` cleanly.
- **No existing DB or ORM** in the target, so a new SQLite/MySQL layer is additive, not a change.

---

## 2. REFERENCE APP — `C:\3-concept-builder-classes-app`

### 2.1 Tech stack

| Layer           | Technology                                                                                   |
| --------------- | -------------------------------------------------------------------------------------------- |
| Student app     | **React Native 0.74 + Expo 51** (NOT web). `@react-navigation`, `zustand`, `axios`, `expo-*` |
| Admin dashboard | React 18 + Vite 5 + `react-router-dom` 6 + Tailwind 3 + `recharts` + `zustand`               |
| Backend         | **Django 5 + DRF + SimpleJWT**, Celery/Redis, MySQL (sqlite fallback), `db.sqlite3` present  |
| Auth            | JWT (access/refresh), custom `User` + `Role` RBAC model                                      |
| Payments        | Razorpay + Stripe                                                                            |
| Other           | Firebase FCM, video CDN signing, cloud storage abstraction, OTP codes                        |

### 2.2 Backend — Django apps & models (36+ models)

- **users:** Role, User, Profile, OTPCode
- **courses:** Category, PricingPlan, Course, Module, Lesson, PYQPaper
- **content:** YouTubeSubject/Chapter/Video, SocialLink, StudyMaterial, StoredFile, FAQ,
  ImpQuestion(Subject/Chapter/PDF), HandwrittenNotes(Subject/Chapter/PDF),
  University, Branch, Year, Semester, Subject, SubjectUnit,
  **BTech** StudyMaterial / PYQ / QuestionPaper / VideoLecture / ImpQuestion / LabManual,
  Job, Internship, PlacementMaterial, CodingLanguage / Topic / Problem, Badge, UserBadge
- **learning:** Video, LessonResource, Quiz, QuizQuestion, QuizOption, QuizAttempt,
  Assignment, AssignmentSubmission, Project, ProjectSubmission, Enrollment, LessonProgress,
  Streak, Achievement, UserAchievement, Roadmap, RoadmapNode
- **payments:** Coupon, Order, PaymentAttempt, Payment, Entitlement
- **community:** Post, Comment, Like, Bookmark, Report
- **certificates:** Certificate, CertificateVerification
- **notifications:** Notification, NotificationCampaign
- **support:** SupportTicket, AuditLog
- **analytics:** AnalyticsEvent, PlatformSetting, IntegrationConfig, MediaAsset

API prefix: `/api/v1/` — auth, users, courses, learning, payments, certificates, community,
notifications, analytics, admin(integrations), support, content, dashboard-counts.
Health: `/api/v1/health/`. Seeded logins: `admin@codingwithkesh.com / Admin@12345`,
`student1@example.com / Student@123`.

### 2.3 Student app (Expo/RN) — screens by domain

- **auth:** Splash, Onboarding, Login, Register, OtpVerification, ForgotPassword, ResetPassword
- **home:** Home, Explore, SelectCategory, CoursesTab, Notes, HandwrittenNotes(+Chapters/PDFs),
  ImpQuestions(+Chapters/PDFs), PYQ, QuizzesHub, Tests, YouTube(Subjects/Chapters/Player),
  Search, SocialLinks
- **courses:** CourseDetails, Curriculum, Checkout, PaymentResult
- **learning:** Curriculum, LessonResources, VideoPlayer, PdfViewer, SourceCodeViewer,
  TemplateLibrary, ProtectedVideoStatus
- **assessment:** Quiz, QuizDetail, QuizResult, Assignment, Project, ProjectSubmission
- **progress:** MyLearning, Downloads, OfflineManager
- **study:** Notes, Bookmarks · **community:** Community, PostDetail, CreatePost, Notifications
- **certification:** Certificates, CertificateDetail, CertificateVerification
- **gamification:** Achievements, Streaks, LearningRoadmap
- **advanced:** AiMentor, LearningAnalytics, Subscription, ErrorOffline
- **account:** Profile, Settings, Appearance, AccountSecurity, About, Support, Privacy, Terms
- **tabs:** AskDoubts, Whatsapp
- **admin (in-app, ~30 screens):** Dashboard, Courses/Content, Curriculum, ModuleLessons,
  Students(+Detail), Quizzes, Materials, PYQ, FAQ, Coupons, Orders, Notifications, Settings,
  SocialLinks, YouTube(Subject/Chapter/Video), HandwrittenNotes(Subject/Chapter/PDF),
  ImpQuestions(Subject/Chapter/PDF)

### 2.4 Admin dashboard (React/Vite) — 100+ files

- Layouts: AdminLayout, AuthLayout, Sidebar, Topbar, navConfig (**12 nav groups**, see below)
- Shared UI kit: DataTable, Modal, FormField, Badge, StatCard, PageHeader, ResourceListPage,
  IntegrationConfigPage, StatusStates
- Pages grouped exactly like `navConfig.ts`: Overview, Academics, Study Material,
  Tests & Assessment, Coding Hub, Careers & Placement, User Management, Engagement,
  AI & Analytics, Operations, Configuration, Admin.
- State: zustand (`authStore`, `uiStore`); services layer per resource (`axios`).

### 2.5 Branding to remove for B.TECH portal (DEBRANDING)

`Coding with Kesh`, `ConceptBuilder Classes`, `cbclasses-backend.onrender.com`,
`codingwithkesh.com`, `cb_api_url_override`, logo `splash-logo.jpg`, package names
`coding-with-kesh-*`, `concept-builder-*` APKs, meta/title strings.

---

## 3. STACK DIFFERENCES (the crux)

| Aspect     | Target (NoteFlow)       | Reference                                    | Conflict                                                           |
| ---------- | ----------------------- | -------------------------------------------- | ------------------------------------------------------------------ |
| Student UI | Web React               | **React Native / Expo**                      | RN components (`View`, `Text`) do **not** run in the browser as-is |
| Router     | react-router 7          | RN navigation / admin uses RR6               | Versions differ but both web-capable for admin                     |
| Styling    | Tailwind v4 + `--cf-*`  | Tailwind 3 (admin) / RN StyleSheet (student) | Class syntax + token names differ                                  |
| Backend    | Express/Node, **no DB** | **Django/Python**, MySQL/sqlite              | Two different runtimes; Python needed for Django                   |
| Auth       | Custom in-memory        | JWT + RBAC                                   | Independent auth models                                            |

**Key implications**

1. The **student app cannot be "ported" 1:1 to web** — RN screens must be _rewritten_ as web
   React components (logic/API reuse is possible; JSX/RN primitives are not).
2. The **Django backend is Python** — it can either (a) run alongside the Express server as a
   separate service, or (b) be partially re-implemented in Express. Re-implementing 36+ models
   and dozens of endpoints is large and risky.
3. The reference **admin dashboard** is already web React and is the most directly portable.

---

## 4. OPEN QUESTIONS FOR YOU (before Step 1)

These are **not guesses on my part** — they materially change the plan, so I need your call:

1. **Where does the reference backend live at runtime?**
   - (A) Run the Django backend as a separate service (needs Python + pip + DB) and have the
     new Library UI call it via a proxy from `server.ts`.
   - (B) Re-implement a minimal backend in Express/SQLite inside this project _(big, risky,
     and technically a "new feature", which your rules discourage)_.
   - (C) Point at an already-deployed backend URL (config via `.env`).
     Which one?

2. **Is the B.Tech portal content already in the same Django DB** (the models show
   `BTech*` tables and `admin-dashboard/src/pages/content/BTech*.tsx`), or should B.Tech be a
   _separate_ database/collections as your brief says? If separate, do you want two Django
   instances, or one DB with a `portal` discriminator column?

3. **Student portal delivery shape** — given RN ≠ web:
   - (a) Rewrite student screens as **web React** inside this site (faithful UI, your Tailwind theme), or
   - (b) Embed the existing **Expo web** build (`expo start --web`) in an iframe/micro-frontend, or
   - (c) Something else?

See **§5 Approach options** for my recommendation.

---

## 5. APPROACH OPTIONS (my recommendation marked ★)

**Option A — Native port into the target app (web React), shared Django API**

- Rewrite reference student + admin screens as web React components in `src/library/…`,
  styled with the existing Tailwind/`--cf-*` theme, mounted at new routes behind `/library`.
- Reuse the **real Django API** for data/auth (no logic rewrite).
- ✅ Consistent look/feel, dark-mode works, no iframe seams, best long-term.
- ⚠️ Largest effort (many screens rewritten); needs the Django backend running.

**Option B — Sub-app / micro-frontend (iframe) mounted under `/library`**

- Build/keep the reference admin (web) and Expo-web student app as separate bundles, served
  under `/library/*` and embedded.
- ✅ Fastest to reach "all features work"; reference code stays intact.
- ❌ Loses the site's visual consistency, dark theme, animations; iframe sizing/routing/auth
  pain; hurts the "premium, consistent" Library requirement.

★ **Option C (recommended) — Hybrid, phased**

1. **Now:** Build the new **Library landing screen** (2 portal cards) natively in this site —
   fully themed, animated, consistent (this is low-risk and independent of the backend choice).
2. **Class 9–12 portal:** port the **admin dashboard** (already web React → most portable) and
   rewrite student screens as web React, all talking to the Django API (Option A for UI).
   Reuse the Django backend as-is (no backend rewrite).
3. **B.Tech portal:** same web-React UI, debranded via a config file, pointed at a separate
   data namespace (decide 4.2), with a distinct theme.

- ✅ Satisfies "reuse backend, don't rewrite logic", keeps site consistency, and lets us ship
  the Library landing screen immediately while the backend hosting question is settled.

---

## 6. SCOPE GUARDRAILS (will be honoured)

- Only `src/library/**` (new), the `/library` route in `src/App.tsx`, the Library entry in
  `src/components/TopNav.tsx`, and **additive** `server.ts` route mounts will change.
- Header, footer, other tools, other routes, existing types/api/db stay untouched.
- Reference repo stays READ-ONLY.
- `.env.example` for any new secrets; nothing hard-coded.

---

## 7. BLOCKERS SUMMARY

1. The reference **student app is React Native**, not web — cannot be ported verbatim.
2. The reference **backend is Django/Python** — hosting/runtime decision required.
3. **B.Tech vs 9–12 data separation** strategy required.
4. Environment: `node`/`npm` not on PATH (use full path, noted above).
