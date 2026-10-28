# MIGRATION CHECKLIST

Tracks every reference-app feature and its status in this web app.
Legend: ✅ done · 🟡 partial · ⬜ pending

Reference: `C:\3-concept-builder-classes-app` (READ-ONLY)
Target: `c:\6-noteflow-ai` → Library section (`/library`)

> Important distinction honoured throughout: the reference **student app is React
> Native** and the reference **backend is Django**, so this is a faithful _port_
> of behaviour and API contracts into the site's own Node backend + web React UI.
> UI is pixel-adapted to the site's Tailwind theme (RN ≠ HTML).

---

## A. Library shell & portals

| Feature                                | Status | Notes                                                       |
| -------------------------------------- | ------ | ----------------------------------------------------------- |
| Library landing with 2 portal cards    | ✅     | `src/library/screens/LibraryHome.tsx`, animated, responsive |
| Class 9–12 portal entry                | ✅     | `/library/school/*`                                         |
| B.Tech portal entry (debranded)        | ✅     | `/library/btech/*`, neutral "BTech Hub"                     |
| Independent data namespaces per portal | ✅     | `server/library/store.ts` (school / btech)                  |
| Config-driven branding/theme/taxonomy  | ✅     | `src/library/config/portals.ts`                             |

## B. Authentication

| Feature                            | Status | Notes                                          |
| ---------------------------------- | ------ | ---------------------------------------------- |
| Student login                      | ✅     | portal-scoped, seeded `student1@…/Student@123` |
| Admin login                        | ✅     | seeded `admin@…/Admin@12345`                   |
| Student register + validations     | ✅     | name/email/password rules                      |
| Session restore (`/auth/me`)       | ✅     | token in localStorage per portal               |
| Logout                             | ✅     |                                                |
| OTP verification / forgot-password | ⬜     | reference has it; pending                      |
| Google/GitHub social login         | ⬜     | reference has Google; pending                  |
| JWT refresh rotation               | ⬜     | single 7-day token for now                     |

## C. Student — learning & content

| Feature                                           | Status | Notes                                                   |
| ------------------------------------------------- | ------ | ------------------------------------------------------- |
| Courses catalogue + filters (class/sem)           | ✅     | `CoursesList`                                           |
| Course detail + syllabus                          | ✅     | `CourseDetail`, modules/lessons                         |
| Enroll in course                                  | ✅     |                                                         |
| Study material (notes/PYQ/important/syllabus/lab) | ✅     | `StudyDocs`, kind + group filters                       |
| Quizzes list + runner + auto-grade + result       | ✅     | `QuizzesList`, `QuizRunner`                             |
| My Learning dashboard (stats, counters)           | ✅     | `StudentDashboard`, animated counters                   |
| Handwritten notes (separate section)              | 🟡     | modelled via `studyDocs.kind`; dedicated screen pending |
| Video player / lesson resources                   | ⬜     | reference has VideoPlayer, SourceCodeViewer             |
| Assignments & submissions                         | ⬜     | pending                                                 |
| Projects & submissions                            | ⬜     | pending                                                 |
| Bookmarks / downloads / offline                   | ⬜     | pending                                                 |
| Certificates + verification                       | ⬜     | pending                                                 |
| Gamification (badges, streaks, roadmap)           | ⬜     | pending                                                 |
| Community (posts, comments, likes)                | ⬜     | pending                                                 |
| AI mentor / learning analytics                    | ⬜     | pending                                                 |
| Payments / checkout / subscriptions               | ⬜     | pending                                                 |

## D. Admin dashboard

| Feature                                     | Status | Notes                                         |
| ------------------------------------------- | ------ | --------------------------------------------- |
| Admin overview (stats)                      | ✅     | `AdminDashboard`                              |
| Course CRUD (list/create/edit/soft-delete)  | ✅     | `AdminCourses`                                |
| Student/user management (list/search/roles) | ✅     | `AdminUsers`                                  |
| Curriculum / module-lesson management       | ✅     | `AdminCurriculum` (builder + API)             |
| Study material CRUD                         | ✅     | `AdminStudyDocs` (create/edit/delete)         |
| Quiz builder (questions/options)            | ✅     | `AdminQuizzes` (correct answer + explanation) |
| Orders / coupons / payments admin           | ⬜     | pending                                       |
| Notifications / campaigns                   | ⬜     | pending                                       |
| Integrations / settings                     | ⬜     | pending                                       |
| Site content (FAQ, social links, YouTube)   | ⬜     | pending                                       |

## E. Platform / infrastructure

| Feature                                  | Status | Notes                                           |
| ---------------------------------------- | ------ | ----------------------------------------------- |
| Backend API `/api/library/*`             | ✅     | additive; site untouched                        |
| Persistence (JSON file store)            | ✅     | zero-dependency, `library-data.json`            |
| Password hashing (scrypt) + HMAC tokens  | ✅     | `server/library/auth.ts`                        |
| Seed data (both portals, sample content) | ✅     | `server/library/seed.ts`                        |
| `.env.example` for Library secret        | ✅     | `LIBRARY_JWT_SECRET`                            |
| Regression: rest of site unaffected      | ✅     | only route + nav entry + 1 server mount touched |

---

## How to run & test

```powershell
# Node/npm are not on PATH in this environment:
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
cd c:\6-noteflow-ai
& 'C:\Program Files\nodejs\npm.cmd' run dev     # http://localhost:3000
& 'C:\Program Files\nodejs\npm.cmd' run lint    # tsc --noEmit
```

Routes:

- `/library` — landing (2 portals)
- `/library/school` — school login → dashboard/courses/notes/quizzes
- `/library/school/admin` — school admin (staff only)
- `/library/btech` — B.Tech login → dashboard/courses/notes/quizzes
- `/library/btech/admin` — B.Tech admin

Seeded logins:

- School admin `admin@codingwithkesh.com` / `Admin@12345`
- School student `student1@example.com` / `Student@123`
- B.Tech admin `admin@btechhub.com` / `Admin@12345`
- B.Tech student `student1@btechhub.com` / `Student@123`

---

## Next chunks (agreed order)

1. **Chunk 2 (Part 1, Class 9–12):** remaining student features (video/lesson resources,
   assignments/projects, bookmarks, certificates, gamification, community, notifications)
   - remaining admin CRUD (curriculum, quiz builder, material UI, orders, settings).
2. **Chunk 3 (Part 2, B.Tech):** mirror chunk 2 into the B.Tech portal with its own theme
   and content already seeded; ensure debranding across all new copy/meta.
3. **Final:** full regression pass, build check, and a written final summary.
