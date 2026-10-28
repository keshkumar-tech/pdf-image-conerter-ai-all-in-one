export interface Paginated<T> { count: number; next: string | null; previous: string | null; results: T[]; }

export interface Category { id: string; name: string; slug: string; icon: string; }
export interface PricingPlan { id: string; name: string; price: number; currency: string; discount_price: number | null; features: string[]; }
export interface Course {
  id: string; title: string; slug: string; short_description: string; description: string;
  thumbnail_url: string; banner_url: string; category: Category | null; level: string;
  instructor_name: string; language: string; is_free: boolean; is_published: boolean;
  pricing_plan: PricingPlan | null;
  rating_average: number; students_count: number; duration_minutes: number;
  tags: string[]; requirements: string[]; learning_outcomes: string[]; youtube_playlist_url: string;
  // new dynamic fields
  batch_name: string;
  start_date: string | null;
  end_date: string | null;
  highlights: string[];
}
export interface Module { id: string; course: string; title: string; description: string; order: number; lessons: Lesson[]; }
export interface Lesson {
  id: string; module: string; title: string; lesson_type: string; order: number;
  is_free_preview: boolean; duration_minutes: number; is_published: boolean;
}
export interface VideoPlayback {
  signed_url: string;
  youtube_url?: string;
  provider?: string;
  expires_at: string | null;
  resume_position_seconds: number;
}
export interface LessonResource {
  id: string; lesson: string; resource_type: string; title: string; file_url: string; external_url: string; is_premium_only: boolean;
}
export interface QuizOption {
  id: string;
  text: string;
  order: number;
  is_correct?: boolean;
}

export interface QuizQuestion {
  id: string;
  quiz?: string;
  question_type: string;
  prompt: string;
  explanation?: string;
  marks?: number;
  order: number;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  lesson?: string | null;
  title: string;
  description?: string;
  instructions?: string;
  class_level?: string;
  subject?: string;
  topic?: string;
  difficulty?: "Easy" | "Medium" | "Hard" | string;
  time_limit_seconds: number;
  passing_score_percent: number;
  marks_per_question?: number;
  total_marks?: number;
  is_free?: boolean;
  is_published?: boolean;
  allow_back_navigation?: boolean;
  sort_order?: number;
  questions_count?: number;
  questions: QuizQuestion[];
}

export interface QuestionReviewItem {
  question_id: string;
  prompt: string;
  explanation?: string;
  order: number;
  marks: number;
  options: Array<{
    id: string;
    text: string;
    is_correct: boolean;
    order: number;
  }>;
  user_selected: string[];
  is_correct: boolean;
  is_unattempted: boolean;
}

export interface QuizAttempt {
  id: string;
  quiz: string;
  user?: string;
  answers: Record<string, string[]>;
  total_questions?: number;
  correct_answers?: number;
  incorrect_answers?: number;
  unattempted_questions?: number;
  score?: number | string;
  score_percent: number;
  passed: boolean;
  time_taken_seconds?: number;
  submitted_at?: string;
  quiz_title?: string;
  quiz_subject?: string;
  quiz_class_level?: string;
  passing_score_percent?: number;
  review?: QuestionReviewItem[];
}
export interface Assignment { id: string; lesson: string; title: string; instructions: string; deadline_days: number | null; max_score: number; }
export interface AssignmentSubmission {
  id: string; assignment: string; text_submission: string; link_submission: string; file_url: string;
  status: string; grade: number | null; feedback: string;
}
export interface Project { id: string; lesson: string; title: string; brief: string; requirements: string[]; resources: string[]; }
export interface ProjectSubmission {
  id: string; project: string; github_url: string; zip_url: string; demo_url: string;
  status: string; grade: number | null; feedback: string;
}
export interface Enrollment {
  id: string; course: string; course_detail?: Course;
  enrolled_at: string; completed_at: string | null;
}
export interface LessonProgress { id: string; lesson: string; is_completed: boolean; watch_time_seconds: number; last_position_seconds: number; }
export interface Streak { current_streak_days: number; longest_streak_days: number; last_active_date: string | null; }
export interface Achievement { id: string; key: string; title: string; description: string; icon: string; }
export interface RoadmapNode { id: string; title: string; course: string | null; order: number; }
export interface Roadmap { id: string; title: string; description: string; nodes: RoadmapNode[]; }
export interface Certificate {
  id: string; certificate_number: string; course: string; course_title: string;
  issued_at: string; pdf_url: string; qr_code_url: string;
}
export interface NotificationItem { id: string; notification_type: string; title: string; body: string; is_read: boolean; created_at: string; }
export interface CommunityPost {
  id: string; author: string; course: string | null; title: string; body: string; tags: string[];
  is_question: boolean; likes_count: number; comments_count: number; created_at: string; is_liked: boolean;
  comments: CommunityComment[];
}
export interface CommunityComment { id: string; post: string; author: string; body: string; created_at: string; }
export interface Order { id: string; course: string | null; amount: number; currency: string; status: string; provider: string; }
export interface Entitlement { id: string; course: string; expires_at: string | null; is_active: boolean; }
export interface StudentAnalytics {
  study_time_minutes: number; courses_completed: number; lessons_completed: number;
  quiz_average_percent: number; assignments_submitted: number; projects_submitted: number; current_streak_days: number;
}

// ── Content (PYQ, YouTube, Social Links, FAQ) ───────────────────────────────
export interface PYQPaper {
  id: number;
  title: string;
  subject: string;
  year: string;
  class_level: string;
  pages: number;
  is_free: boolean;
  pdf_url: string;
  pdf_file: string | null;
  pdf: string | null;
  sort_order: number;
  is_active: boolean;
}

export type MaterialCategory = "ncert" | "paid-test" | "paid-notes" | "free-notes" | "free-test";

export interface StudyMaterial {
  id: number;
  title: string;
  category: MaterialCategory;
  subject: string;
  class_level: string;
  description: string;
  file_url: string;
  file: string | null;
  pdf: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface YouTubeVideo {
  id: number;
  chapter: number;
  title: string;
  video_id: string;
  duration: string;
  order: number;
  is_active: boolean;
}

export interface YouTubeChapter {
  id: number;
  subject: number;
  title: string;
  order: number;
  is_active: boolean;
  videos: YouTubeVideo[];
}

export interface YouTubeSubject {
  id: number;
  subject_id: string;
  name: string;
  icon: string;
  color: string;
  class_level: string;
  sort_order: number;
  is_active: boolean;
  chapters_count: number;
  chapters?: YouTubeChapter[];
}

export interface SocialLink {
  id: number;
  platform: string;
  label: string;
  url: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
}

export interface ImpQuestionSubject {
  id: number;
  class_level: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  chapters_count?: number;
  chapters?: ImpQuestionChapter[];
}

export interface ImpQuestionChapter {
  id: number;
  subject: number;
  title: string;
  order: number;
  is_active: boolean;
  pdfs?: ImpQuestionPDF[];
}

export interface ImpQuestionPDF {
  id: number;
  chapter: number;
  title: string;
  pdf_url: string;
  pdf_file: string | null;
  pdf: string | null;
  pages: number;
  is_free: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface HandwrittenNotesSubject {
  id: number;
  class_level: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  chapters_count?: number;
  chapters?: HandwrittenNotesChapter[];
}

export interface HandwrittenNotesChapter {
  id: number;
  subject: number;
  title: string;
  order: number;
  is_active: boolean;
  pdfs?: HandwrittenNotesPDF[];
}

export interface HandwrittenNotesPDF {
  id: number;
  chapter: number;
  title: string;
  pdf_url: string;
  pdf_file: string | null;
  pdf: string | null;
  pages: number;
  is_free: boolean;
  sort_order: number;
  is_active: boolean;
}
