import type { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  OtpVerification: { email: string; purpose: "register" | "login" | "reset_password" };
  ForgotPassword: undefined;
  ResetPassword: { email: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  CoursesTab: undefined;
  MyCoursesTab: undefined;
  DownloadsTab: undefined;
  AskDoubtsTab: undefined;
  WhatsappTab: undefined;
};

export type CategoryType =
  | "paid" | "free" | "ncert" | "paid-test" | "paid-notes"
  | "free-notes" | "free-test" | "live";

export type RootStackParamList = {
  Splash: undefined;
  AuthStack: undefined;
  AdminStack: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;

  Search: undefined;
  SelectCategory: undefined;
  CategoryContent: { type: CategoryType };
  CourseDetails: { courseId: string };
  Curriculum: { courseId: string };
  Checkout: { courseId: string };
  PaymentResult: { orderId: string; success: boolean; courseId?: string };

  VideoPlayer: { lessonId: string; videoId: string };
  ProtectedVideoStatus: { videoId: string };
  LessonResources: { lessonId: string };
  PdfViewer: { title: string; fileUrl: string };
  SourceCodeViewer: { resourceId: string; title: string };
  TemplateLibrary: undefined;

  Notes: { lessonId?: string };
  Bookmarks: undefined;

  QuizDetail: { quizId: string };
  Quiz: { quizId: string };
  QuizResult: { attemptId: string };
  Assignment: { assignmentId: string };
  Project: { projectId: string };
  ProjectSubmission: { projectId: string };

  MyLearning: undefined;
  Downloads: undefined;
  OfflineManager: undefined;

  Certificates: undefined;
  CertificateDetail: { certificateId: string };
  CertificateVerification: undefined;

  LearningRoadmap: { roadmapId?: string };
  Streaks: undefined;
  Achievements: undefined;

  Notifications: undefined;
  Community: undefined;
  PostDetail: { postId: string };
  CreatePost: undefined;

  Profile: undefined;
  Settings: undefined;
  Appearance: undefined;
  AccountSecurity: undefined;
  Support: undefined;
  About: undefined;
  SocialLinks: undefined;
  PrivacyPolicy: undefined;
  TermsConditions: undefined;

  AiMentor: undefined;
  LearningAnalytics: undefined;
  Subscription: undefined;
  ErrorOffline: undefined;

  // PYQ
  PYQHub: undefined;

  // YouTube
  YouTubeSubjects: undefined;
  YouTubeChapters: { subject: string | number; classLevel: string };
  YouTubePlayer: { videoId: string; title: string };

  // Tests
  Tests: undefined;

  // Notes
  HandwrittenNotes: undefined;
  HandwrittenNoteChapters: { subject: string | number; classLevel: string };
  HandwrittenNotePDFs: { chapter: string | number; subjectName?: string };

  // Imp Questions
  ImpQuestions: undefined;
  ImpQuestionChapters: { subject: string | number; classLevel: string };
  ImpQuestionPDFs: { chapter: string | number; subjectName?: string };

  // Quizzes Hub
  QuizzesHub: undefined;
};
