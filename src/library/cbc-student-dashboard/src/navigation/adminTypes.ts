export type AdminStackParamList = {
  AdminTabs: undefined;

  // Tab screens
  AdminDashboard: undefined;
  AdminCourses: undefined;
  AdminStudents: undefined;
  AdminOrders: undefined;
  AdminSettings: undefined;

  // Content management (from Content tab)
  AdminContent: undefined;
  AdminPYQ: undefined;
  AdminPYQForm: { id: number | null };
  AdminYouTube: undefined;
  AdminYouTubeSubjectForm: { id: number | null };
  AdminYouTubeChapters: { subjectId: number; subjectName: string };
  AdminYouTubeChapterForm: { subjectId: number; id: number | null };
  AdminYouTubeVideoForm: { chapterId: number; id: number | null };
  AdminSocialLinks: undefined;
  AdminSocialLinkForm: { id: number | null };
  AdminFAQ: undefined;
  AdminFAQForm: { id: number | null };
  AdminNotifications: undefined;
  AdminCoupons: undefined;
  AdminCouponForm: { id: string | null };

  // Handwritten Notes
  AdminHandwrittenNotes: undefined;
  AdminHandwrittenNotesSubjectForm: { id: number | null };
  AdminHandwrittenNotesChapters: { subjectId: number; subjectName: string };
  AdminHandwrittenNotesChapterForm: { subjectId: number; id: number | null };
  AdminHandwrittenNotesPDFs: { chapterId: number; subjectName?: string };
  AdminHandwrittenNotesPDFForm: { chapterId: number; id: number | null };

  // Important Questions
  AdminImpQuestions: undefined;
  AdminImpQuestionsSubjectForm: { id: number | null };
  AdminImpQuestionsChapters: { subjectId: number; subjectName: string };
  AdminImpQuestionsChapterForm: { subjectId: number; id: number | null };
  AdminImpQuestionsPDFs: { chapterId: number; subjectName?: string };
  AdminImpQuestionsPDFForm: { chapterId: number; id: number | null };

  // Study materials (NCERT books, paid/free tests & notes)
  AdminMaterials: { category: string; title: string };
  AdminMaterialForm: { id: number | null; category: string; title: string };
  AdminQuizzes: undefined;
  AdminQuizForm: { quizId: string | null };

  // Push screens from courses tab
  AdminCourseForm: { courseId: string | null };
  AdminCurriculum: { courseId: string; courseTitle: string };
  AdminModuleLessons: { courseId: string; moduleId: string; moduleTitle: string };

  // Push screens from students tab
  AdminStudentDetail: { userId: string };
};
