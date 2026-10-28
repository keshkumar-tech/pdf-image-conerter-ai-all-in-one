import { apiClient } from "./apiClient";
import type { Paginated } from "./types";

function api<T, TWrite = Partial<T>>(basePath: string) {
  return {
    list: (params?: Record<string, unknown>) => apiClient.get<Paginated<T>>(basePath, { params }).then((r) => r.data),
    retrieve: (id: string) => apiClient.get<T>(`${basePath}${id}/`).then((r) => r.data),
    create: (payload: TWrite) => apiClient.post<T>(basePath, payload).then((r) => r.data),
    update: (id: string, payload: TWrite) => apiClient.patch<T>(`${basePath}${id}/`, payload).then((r) => r.data),
    delete: (id: string) => apiClient.delete(`${basePath}${id}/`).then((r) => r.data),
    remove: (id: string) => apiClient.delete(`${basePath}${id}/`).then((r) => r.data),
    action: <R = unknown>(id: string, action: string, payload?: unknown) =>
      apiClient.post<R>(`${basePath}${id}/${action}/`, payload).then((r) => r.data),
  };
}

import type {
  Achievement, AssignmentSubmission, Certificate, CommunityPost, Course,
  Enrollment, Entitlement, LessonProgress, LessonResource, NotificationItem,
  Order, Project, ProjectSubmission, Quiz, QuizAttempt, Roadmap, Streak, VideoPlayback,
} from "./types";

export const coursesApi = api<Course>("/courses/");
export const modulesApi = {
  list: (courseId: string) => apiClient.get<Paginated<import("./types").Module>>("/courses/modules/", { params: { course: courseId } }).then((r) => r.data),
  curriculum: (slug: string) => apiClient.get<import("./types").Module[]>("/courses/modules/curriculum/", { params: { course: slug } }).then((r) => r.data),
};
export const videosApi = { playback: (videoId: string) => apiClient.get<VideoPlayback>(`/videos/${videoId}/playback/`).then((r) => r.data) };
export const resourcesApi = api<LessonResource>("/resources/");
export const quizzesApi = api<Quiz>("/quizzes/");
export const quizAttemptsApi = api<QuizAttempt>("/quiz-attempts/");
export const assignmentSubmissionsApi = api<AssignmentSubmission>("/assignment-submissions/");
export const projectsApi = api<Project>("/projects/");
export const projectSubmissionsApi = api<ProjectSubmission>("/project-submissions/");
export const enrollmentsApi = api<Enrollment>("/enrollments/");
export const progressApi = api<LessonProgress>("/progress/");
export const streakApi = { get: () => apiClient.get<{ results: Streak[] }>("/streak/").then((r) => r.data.results[0]) };
export const achievementsApi = api<Achievement>("/achievements/");
export const myAchievementsApi = api("/my-achievements/");
export const roadmapsApi = api<Roadmap>("/roadmaps/");
export const certificatesApi = api<Certificate>("/certificates/");
export const notificationsApi = api<NotificationItem>("/notifications/");
export const communityPostsApi = api<CommunityPost>("/community/posts/");
export const ordersApi = api<Order>("/orders/");
export const entitlementsApi = api<Entitlement>("/entitlements/");

// ── Content APIs (PYQ, YouTube, Social Links, FAQ, Imp Questions, Handwritten Notes) ──
import type { FAQ, HandwrittenNotesChapter, HandwrittenNotesPDF, HandwrittenNotesSubject, ImpQuestionChapter, ImpQuestionPDF, ImpQuestionSubject, PYQPaper, SocialLink, StudyMaterial, YouTubeChapter, YouTubeSubject, YouTubeVideo } from "./types";
export const pyqApi             = api<PYQPaper>("/content/pyq/");
export const materialsApi       = api<StudyMaterial>("/content/materials/");
export const youtubeSubjectsApi = api<YouTubeSubject>("/content/youtube-subjects/");
export const youtubeChaptersApi = api<YouTubeChapter>("/content/youtube-chapters/");
export const youtubeVideosApi   = api<YouTubeVideo>("/content/youtube-videos/");
export const socialLinksApi     = api<SocialLink>("/content/social-links/");
export const faqApi             = api<FAQ>("/content/faqs/");
export const impQuestionsApi    = api<ImpQuestionSubject>("/content/imp-questions/");
export const impQuestionChaptersApi = api<ImpQuestionChapter>("/content/imp-question-chapters/");
export const impQuestionPDFsApi = api<ImpQuestionPDF>("/content/imp-question-pdfs/");
export const handwrittenNotesApi = api<HandwrittenNotesSubject>("/content/handwritten-notes/");
export const handwrittenNoteChaptersApi = api<HandwrittenNotesChapter>("/content/handwritten-note-chapters/");
export const handwrittenNotePDFsApi = api<HandwrittenNotesPDF>("/content/handwritten-note-pdfs/");
