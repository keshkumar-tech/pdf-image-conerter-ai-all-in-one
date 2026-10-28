import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

import LoginPage from "@/pages/auth/LoginPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import UsersPage from "@/pages/users/UsersPage";
import UserDetailPage from "@/pages/users/UserDetailPage";
import RolesPermissionsPage from "@/pages/users/RolesPermissionsPage";
import CoursesPage from "@/pages/courses/CoursesPage";
import CourseEditorPage from "@/pages/courses/CourseEditorPage";
import CurriculumBuilderPage from "@/pages/courses/CurriculumBuilderPage";
import LessonEditorPage from "@/pages/courses/LessonEditorPage";
import ResourceManagerPage from "@/pages/courses/ResourceManagerPage";
import PdfManagerPage from "@/pages/courses/PdfManagerPage";
import SourceCodeManagerPage from "@/pages/courses/SourceCodeManagerPage";
import TemplateManagerPage from "@/pages/courses/TemplateManagerPage";
import VideoLibraryPage from "@/pages/video/VideoLibraryPage";
import VideoCdnPage from "@/pages/video/VideoCdnPage";
import QuizzesPage from "@/pages/learning/QuizzesPage";
import AssignmentsPage from "@/pages/learning/AssignmentsPage";
import ProjectsPage from "@/pages/learning/ProjectsPage";
import OrdersPage from "@/pages/commerce/OrdersPage";
import PaymentsPage from "@/pages/commerce/PaymentsPage";
import PaymentGatewayPage from "@/pages/commerce/PaymentGatewayPage";
import EntitlementsPage from "@/pages/commerce/EntitlementsPage";
import CouponsPage from "@/pages/commerce/CouponsPage";
import PricingPlansPage from "@/pages/commerce/PricingPlansPage";
import CertificatesPage from "@/pages/certificates/CertificatesPage";
import NotificationsPage from "@/pages/communication/NotificationsPage";
import FirebasePage from "@/pages/communication/FirebasePage";
import CommunityModerationPage from "@/pages/community/CommunityModerationPage";
import RoadmapsPage from "@/pages/roadmap/RoadmapsPage";
import AnalyticsOverviewPage from "@/pages/analytics/AnalyticsOverviewPage";
import LearningAnalyticsPage from "@/pages/analytics/LearningAnalyticsPage";
import SalesFunnelPage from "@/pages/analytics/SalesFunnelPage";
import ProductAnalyticsPage from "@/pages/analytics/ProductAnalyticsPage";
import MediaLibraryPage from "@/pages/media/MediaLibraryPage";
import CloudStoragePage from "@/pages/media/CloudStoragePage";
import AiMentorPage from "@/pages/ai/AiMentorPage";
import SupportTicketsPage from "@/pages/operations/SupportTicketsPage";
import AuditLogsPage from "@/pages/operations/AuditLogsPage";
import ApiSettingsPage from "@/pages/configuration/ApiSettingsPage";
import SecuritySettingsPage from "@/pages/configuration/SecuritySettingsPage";
import GeneralSettingsPage from "@/pages/configuration/GeneralSettingsPage";
import BrandingPage from "@/pages/configuration/BrandingPage";
import EmailSmsPage from "@/pages/configuration/EmailSmsPage";
import AppConfigurationPage from "@/pages/configuration/AppConfigurationPage";
import MaintenancePage from "@/pages/configuration/MaintenancePage";
import AdminProfilePage from "@/pages/account/AdminProfilePage";
import GlobalSearchPage from "@/pages/account/GlobalSearchPage";
import ActivityCenterPage from "@/pages/account/ActivityCenterPage";
import HandwrittenNotesPage from "@/pages/content/HandwrittenNotesPage";
import HandwrittenNoteFormScreen from "@/pages/content/HandwrittenNoteFormScreen";
import HandwrittenNoteChaptersPage from "@/pages/content/HandwrittenNoteChaptersPage";
import HandwrittenNoteChapterFormScreen from "@/pages/content/HandwrittenNoteChapterFormScreen";
import HandwrittenNotePDFsPage from "@/pages/content/HandwrittenNotePDFsPage";
import ImpQuestionsPage from "@/pages/content/ImpQuestionsPage";
import ImpQuestionFormScreen from "@/pages/content/ImpQuestionFormScreen";
import ImpQuestionChaptersPage from "@/pages/content/ImpQuestionChaptersPage";
import ImpQuestionChapterFormScreen from "@/pages/content/ImpQuestionChapterFormScreen";
import NotFoundPage from "@/pages/system/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/roles" element={<RolesPermissionsPage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />

          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/new" element={<CourseEditorPage />} />
          <Route path="/courses/curriculum" element={<CurriculumBuilderPage />} />
          <Route path="/courses/lessons/:id" element={<LessonEditorPage />} />
          <Route path="/courses/resources" element={<ResourceManagerPage />} />
          <Route path="/courses/pdf-manager" element={<PdfManagerPage />} />
          <Route path="/courses/source-code-manager" element={<SourceCodeManagerPage />} />
          <Route path="/courses/template-manager" element={<TemplateManagerPage />} />
          <Route path="/courses/:id/edit" element={<CourseEditorPage />} />

          <Route path="/video/library" element={<VideoLibraryPage />} />
          <Route path="/video/cdn" element={<VideoCdnPage />} />

          <Route path="/learning/quizzes" element={<QuizzesPage />} />
          <Route path="/learning/assignments" element={<AssignmentsPage />} />
          <Route path="/learning/projects" element={<ProjectsPage />} />

          <Route path="/commerce/orders" element={<OrdersPage />} />
          <Route path="/commerce/payments" element={<PaymentsPage />} />
          <Route path="/commerce/payment-gateway" element={<PaymentGatewayPage />} />
          <Route path="/commerce/entitlements" element={<EntitlementsPage />} />
          <Route path="/commerce/coupons" element={<CouponsPage />} />
          <Route path="/commerce/pricing-plans" element={<PricingPlansPage />} />

          <Route path="/certificates" element={<CertificatesPage />} />

          <Route path="/communication/notifications" element={<NotificationsPage />} />
          <Route path="/communication/firebase" element={<FirebasePage />} />
          <Route path="/communication/community-moderation" element={<CommunityModerationPage />} />

          <Route path="/roadmaps" element={<RoadmapsPage />} />

          <Route path="/analytics/overview" element={<AnalyticsOverviewPage />} />
          <Route path="/analytics/learning" element={<LearningAnalyticsPage />} />
          <Route path="/analytics/sales-funnel" element={<SalesFunnelPage />} />
          <Route path="/analytics/product" element={<ProductAnalyticsPage />} />

          <Route path="/media/library" element={<MediaLibraryPage />} />
          <Route path="/media/cloud-storage" element={<CloudStoragePage />} />

          <Route path="/ai/mentor" element={<AiMentorPage />} />

          <Route path="/operations/support-tickets" element={<SupportTicketsPage />} />
          <Route path="/operations/audit-logs" element={<AuditLogsPage />} />

          <Route path="/configuration/api-settings" element={<ApiSettingsPage />} />
          <Route path="/configuration/security" element={<SecuritySettingsPage />} />
          <Route path="/configuration/general" element={<GeneralSettingsPage />} />
          <Route path="/configuration/branding" element={<BrandingPage />} />
          <Route path="/configuration/email-sms" element={<EmailSmsPage />} />
          <Route path="/configuration/app-config" element={<AppConfigurationPage />} />
          <Route path="/configuration/maintenance" element={<MaintenancePage />} />

          <Route path="/account/profile" element={<AdminProfilePage />} />
          <Route path="/account/search" element={<GlobalSearchPage />} />
          <Route path="/account/activity" element={<ActivityCenterPage />} />

          <Route path="/content/handwritten-notes" element={<HandwrittenNotesPage />} />
          <Route path="/content/handwritten-notes/new" element={<HandwrittenNoteFormScreen />} />
          <Route path="/content/handwritten-notes/:id/edit" element={<HandwrittenNoteFormScreen />} />
          <Route path="/content/handwritten-notes/:id/chapters" element={<HandwrittenNoteChaptersPage />} />
          <Route path="/content/handwritten-notes/:subjectId/chapters/new" element={<HandwrittenNoteChapterFormScreen />} />
          <Route path="/content/handwritten-notes/:subjectId/chapters/:id/edit" element={<HandwrittenNoteChapterFormScreen />} />
          <Route path="/content/handwritten-notes/:subjectId/chapters/:id/pdfs" element={<HandwrittenNotePDFsPage />} />
          <Route path="/content/imp-questions" element={<ImpQuestionsPage />} />
          <Route path="/content/imp-questions/new" element={<ImpQuestionFormScreen />} />
          <Route path="/content/imp-questions/:id/edit" element={<ImpQuestionFormScreen />} />
          <Route path="/content/imp-questions/:id/chapters" element={<ImpQuestionChaptersPage />} />
          <Route path="/content/imp-questions/:subjectId/chapters/new" element={<ImpQuestionChapterFormScreen />} />
          <Route path="/content/imp-questions/:subjectId/chapters/:id/edit" element={<ImpQuestionChapterFormScreen />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
