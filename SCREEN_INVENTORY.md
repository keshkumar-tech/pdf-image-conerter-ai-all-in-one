# SCREEN INVENTORY — reference → web port tracker

Source of truth for "no screen missed". Generated from the reference app file
trees, then tracked here as each is ported.

Legend: ✅ ported & tested · 🟡 partial · ⬜ pending
Reference: `C:\3-concept-builder-classes-app` (READ-ONLY)

> Behaviour/API parity is the goal; UI is adapted to the site's Tailwind theme
> (reference student app is React Native → web-equivalent screens). No static
> demo data in UI: everything renders from the Library API.

---

## A. STUDENT app screens (114 in reference)

### A1. auth (7)

| Screen          | Status                                |
| --------------- | ------------------------------------- |
| Splash          | ⬜ (n/a for web; landing replaces it) |
| Onboarding      | ⬜                                    |
| Login           | ✅ `LibraryLogin`                     |
| Register        | ✅ `LibraryLogin` (mode)              |
| OtpVerification | ⬜                                    |
| ForgotPassword  | ⬜                                    |
| ResetPassword   | ⬜                                    |

### A2. home / content (18)

| Screen                                            | Status                                |
| ------------------------------------------------- | ------------------------------------- |
| Home                                              | 🟡 student dashboard covers summary   |
| Explore                                           | ⬜                                    |
| SelectCategory                                    | ⬜                                    |
| CoursesTab                                        | ✅ `CoursesList`                      |
| Notes                                             | ✅ `StudyDocs` (notes)                |
| HandwrittenNotes (+Chapters, +PDFs)               | ⬜                                    |
| ImpQuestions (+Chapters, +PDFs)                   | 🟡 `StudyDocs` kind filter            |
| PYQ                                               | ✅ via `StudyDocs`                    |
| QuizzesHub                                        | ✅ `QuizzesList`                      |
| Tests                                             | ⬜                                    |
| YouTubeSubjects / YouTubeChapters / YouTubePlayer | ✅ `YouTube` (subject→chapter→player) |
| Search                                            | ⬜                                    |
| SocialLinks                                       | ✅ `FaqSupport` (Connect with us)     |

### A3. courses & learning (12)

| Screen                          | Status                                   |
| ------------------------------- | ---------------------------------------- |
| CourseDetails                   | ✅ `CourseDetail`                        |
| Curriculum (courses + learning) | ✅ `CourseDetail` syllabus               |
| LessonResources                 | ✅ backend `/resources` (screen pending) |
| VideoPlayer                     | ⬜                                       |
| PdfViewer                       | ⬜                                       |
| SourceCodeViewer                | ⬜                                       |
| TemplateLibrary                 | ⬜                                       |
| ProtectedVideoStatus            | ⬜                                       |
| Checkout                        | ⬜                                       |
| PaymentResult                   | ⬜                                       |

### A4. assessment (7)

| Screen                         | Status                                 |
| ------------------------------ | -------------------------------------- |
| Quiz (QuizScreen / QuizDetail) | ✅ `QuizRunner`                        |
| QuizResult                     | ✅ `QuizRunner` (result view)          |
| Assignment                     | ✅ `Assignments` (submit + update)     |
| Project                        | ✅ `Projects`                          |
| ProjectSubmission              | ✅ `Projects` (repo/live/notes submit) |

### A5. progress (3)

| Screen         | Status                |
| -------------- | --------------------- |
| MyLearning     | ✅ `StudentDashboard` |
| Downloads      | ⬜                    |
| OfflineManager | ⬜                    |

### A6. study (2) · community (4) · certification (3) · gamification (3)

| Screen                                   | Status                      |
| ---------------------------------------- | --------------------------- |
| Bookmarks                                | ✅ `Bookmarks` (add/remove) |
| Notes (study)                            | ✅ `StudyDocs`              |
| FAQ                                      | ✅ `FaqSupport`             |
| Community / PostDetail / CreatePost      | ✅ `Community`              |
| Notifications                            | ✅ `Notifications`          |
| Certificates / CertificateVerification   | ✅ `Certificates`           |
| Achievements / Streaks / LearningRoadmap | ✅ `Achievements`           |

### A7. account (8) · advanced (4) · tabs (2) · catalog (1)

| Screen                                            | Status                                 |
| ------------------------------------------------- | -------------------------------------- |
| Profile / Settings / Appearance / AccountSecurity | ✅ `Profile`                           |
| Support                                           | ✅ `Support`                           |
| About / Privacy / Terms                           | 🟡 FaqSupport covers help content      |
| AiMentor / LearningAnalytics                      | ✅ `LearningAnalytics`                 |
| Subscription                                      | ✅ `Subscription` (test-mode checkout) |
| ErrorOffline                                      | ✅ (n/a on web)                        |
| AskDoubtsTab / WhatsappTab                        | 🟡 Community + social links cover this |
| CategoryContent                                   | ⬜                                     |

### A8. in-app admin (30) — same CRUD as dashboard; covered by D below.

---

## B. ADMIN dashboard screens (79 in reference)

### B1. dashboard / courses / learning (already done core)

| Screen                          | Status                           |
| ------------------------------- | -------------------------------- |
| Dashboard                       | ✅ `AdminDashboard`              |
| Courses, CourseEditor           | ✅ `AdminCourses`                |
| CurriculumBuilder, LessonEditor | ✅ `AdminCurriculum`             |
| Quizzes                         | ✅ `AdminQuizzes`                |
| Notes (content)                 | ✅ `AdminStudyDocs` (notes)      |
| Users, UserDetail               | ✅ `AdminUsers` (detail pending) |
| RolesPermissions                | ⬜                               |

### B2. still pending (grouped)

| Group           | Screens                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Content         | HandwrittenNotes(+chapters/pdfs), ImpQuestions(+chapters/pdfs), LabManuals, QuestionPapers, VideoLectures, Quantum, BTech\* (notes/PYQ/imp) |
| Academics       | Universities, Branches, Years, Semesters, Subjects, SubjectUnits                                                                            |
| Coding          | CodingLanguages, CodingTopics, CodingProblems                                                                                               |
| Careers         | Jobs                                                                                                                                        |
| Commerce        | Coupons, Entitlements, Orders, PaymentGateway, Payments, PricingPlans                                                                       |
| Communication   | Notifications, Firebase                                                                                                                     |
| Community       | CommunityModeration                                                                                                                         |
| Configuration   | ApiSettings, AppConfiguration, Branding, EmailSms, GeneralSettings, Maintenance, SecuritySettings                                           |
| Analytics       | AnalyticsOverview, LearningAnalytics, ProductAnalytics, SalesFunnel                                                                         |
| Media/Video     | CloudStorage, MediaLibrary, VideoCdn, VideoLibrary                                                                                          |
| Ops             | AuditLogs, SupportTickets                                                                                                                   |
| Tests           | MockTests, TestQuestions, TestResults                                                                                                       |
| Roadmap         | Roadmaps                                                                                                                                    |
| AI              | AiMentor                                                                                                                                    |
| Account         | ActivityCenter, AdminProfile, GlobalSearch                                                                                                  |
| Courses extras  | PdfManager, ResourceManager, SourceCodeManager, TemplateManager                                                                             |
| Learning extras | Assignments, Projects                                                                                                                       |

---

## C. Progress summary (updated each chunk)

- Student screens ported: ~33 / 114
- Admin screens ported: ~6 / 79
- Backend: auth, courses, curriculum, quizzes, study-docs, enrollments, dashboards, admin CRUD,
  resources, assignments(+submissions), projects(+submissions), bookmarks ✅

### Chunk log

- Chunk 1: foundation (auth, courses, quizzes, study docs, dashboards, admin CRUD) ✅
- Chunk 2(B): admin curriculum builder, quiz builder, study-material manager ✅
- Chunk 2(A): student assignments, projects, bookmarks, lesson-resources API ✅
- Chunk B: YouTube (subject/chapter/player), FAQ, social links + admin CRUD ✅
- Chunk C: community (posts/comments/likes/report), notifications, certificates (+verify), gamification (streak/badges/roadmap) ✅
- Chunk D: AI mentor + learning analytics, subscription/checkout (test-mode), support tickets, profile/security, orders/entitlements/coupons ✅
