export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Category { id: string; name: string; slug: string; icon: string; sort_order: number; }
export interface PricingPlan {
  id: string; name: string; price: number; currency: string;
  discount_price: number | null; duration_days: number | null;
  features: string[]; is_active: boolean; sort_order: number;
}
export interface Course {
  id: string; title: string; slug: string; short_description: string;
  thumbnail_url: string; thumbnail_file?: string; banner_url?: string; banner_file?: string;
  description?: string;
  category: Category | null; level: string; language?: string;
  instructor_name: string; is_free: boolean; pricing_plan: PricingPlan | null;
  is_published: boolean; is_featured: boolean; rating_average: number;
  students_count: number; duration_minutes: number; tags: string[];
  learning_outcomes?: string[]; requirements?: string[];
  youtube_playlist_url?: string;
}
export interface Module { id: string; course: string; title: string; description: string; order: number; lessons?: Lesson[]; }
export interface Lesson {
  id: string; module: string; title: string; lesson_type: string;
  order: number; is_free_preview: boolean; duration_minutes: number; is_published: boolean;
}
export interface AdminUser {
  id: string; email: string; username: string; phone: string; avatar_url: string;
  role: { id: string; key: string; label: string } | null;
  is_active?: boolean; is_email_verified: boolean; theme_preference: string;
  created_at: string; last_active_at: string | null;
}
export interface Role { id: string; key: string; label: string; permissions: string[]; }
export interface Order {
  id: string; user: string; course: string | null; amount: number; currency: string;
  status: string; provider: string; provider_order_id: string; created_at: string;
}
export interface Payment {
  id: string; order: string; provider: string; provider_payment_id: string;
  amount: number; status: string; verified_at: string | null;
}
export interface Coupon {
  id: string; code: string; discount_type: string; discount_value: number;
  max_uses: number | null; used_count: number; valid_from: string | null;
  valid_until: string | null; is_active: boolean;
}
export interface Entitlement {
  id: string; user: string; course: string; granted_at: string;
  expires_at: string | null; is_active: boolean; granted_reason: string;
}
export interface Certificate {
  id: string; certificate_number: string; user: string; course: string;
  course_title: string; issued_at: string; pdf_url: string; qr_code_url: string;
}
export interface Notification {
  id: string; notification_type: string; title: string; body: string; is_read: boolean; created_at: string;
}
export interface NotificationCampaign {
  id: string; title: string; body: string; channel: string; audience: string;
  status: string; scheduled_at: string | null; sent_at: string | null; recipients_count: number;
}
export interface CommunityPost {
  id: string; author: string; course: string | null; title: string; body: string;
  tags: string[]; is_question: boolean; is_hidden: boolean; likes_count: number;
  comments_count: number; created_at: string;
}
export interface Report { id: string; post: string; reporter: string; reason: string; status: string; created_at: string; }
export interface Roadmap { id: string; title: string; description: string; is_published: boolean; nodes: RoadmapNode[]; }
export interface RoadmapNode { id: string; title: string; course: string | null; order: number; }
export interface IntegrationConfig {
  id: string; group: string; provider: string; config: Record<string, unknown>;
  secret_configured: boolean; is_enabled: boolean; last_test_status: string; last_tested_at: string | null;
}
export interface MediaAsset {
  id: string; file_name: string; file_url: string; file_type: string;
  size_bytes: number; access_level: string; created_at: string;
}
export interface SupportTicket {
  id: string; user: string; subject: string; message: string; status: string;
  priority: string; assigned_to: string | null; resolution_notes: string; created_at: string;
}
export interface AuditLog {
  id: string; user: string | null; action: string; entity_type: string;
  entity_id: string; ip_address: string | null; created_at: string;
}
export interface Video {
  id: string; lesson: string; provider: string; duration_seconds: number;
  captions_url: string; is_protected: boolean; thumbnail_url: string;
  youtube_url?: string; video_file?: string; playback_url?: string;
}
export interface QuizOption { id?: string; text: string; is_correct: boolean; order: number; }
export interface QuizQuestion { id?: string; prompt: string; explanation?: string; marks?: number; order?: number; options: QuizOption[]; }
export interface Quiz {
  id: string;
  lesson?: string | null;
  title: string;
  description?: string;
  instructions?: string;
  class_level?: string;
  subject?: string;
  topic?: string;
  difficulty?: string;
  time_limit_seconds: number;
  passing_score_percent: number;
  marks_per_question?: number;
  total_marks?: number;
  is_free?: boolean;
  is_published?: boolean;
  allow_back_navigation?: boolean;
  sort_order?: number;
  questions_count?: number;
  questions?: QuizQuestion[];
}
export interface Assignment { id: string; lesson: string; title: string; instructions: string; deadline_days: number | null; max_score: number; }
export interface Project { id: string; lesson: string; title: string; brief: string; }
export interface LessonResource {
  id: string; lesson: string; resource_type: string; title: string;
  file_url: string; external_url: string; is_premium_only: boolean; download_count: number;
}
export interface AdminOverview {
  total_students: number; active_students: number; new_registrations_30d: number;
  total_courses: number; premium_courses: number; free_courses: number;
  total_revenue: number; total_orders: number; conversion_rate_percent: number;
  course_completion_rate_percent: number;
}
export interface YouTubeFunnelRow {
  utm_source: string; installs: number; signups: number; enrollments: number; purchases: number;
}
