import { useEffect, useState } from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./types";
import { useTheme } from "@/theme/ThemeProvider";
import { useAuthStore } from "@/store/authStore";
import { useStudentClassStore } from "@/store/studentClassStore";
import { useDownloadsStore } from "@/store/downloadsStore";
import { AuthNavigator } from "./AuthNavigator";
import { MainTabs } from "./MainTabs";
import { AdminNavigator } from "./AdminNavigator";

import SplashScreen from "@/screens/auth/SplashScreen";
import SearchScreen from "@/screens/home/SearchScreen";
import SelectCategoryScreen from "@/screens/home/SelectCategoryScreen";
import CategoryContentScreen from "@/screens/catalog/CategoryContentScreen";
import CourseDetailsScreen from "@/screens/courses/CourseDetailsScreen";
import CurriculumScreen from "@/screens/learning/CurriculumScreen";
import CheckoutScreen from "@/screens/courses/CheckoutScreen";
import PaymentResultScreen from "@/screens/courses/PaymentResultScreen";
import VideoPlayerScreen from "@/screens/learning/VideoPlayerScreen";
import ProtectedVideoStatusScreen from "@/screens/learning/ProtectedVideoStatusScreen";
import LessonResourcesScreen from "@/screens/learning/LessonResourcesScreen";
import PdfViewerScreen from "@/screens/learning/PdfViewerScreen";
import SourceCodeViewerScreen from "@/screens/learning/SourceCodeViewerScreen";
import TemplateLibraryScreen from "@/screens/learning/TemplateLibraryScreen";
import BookmarksScreen from "@/screens/study/BookmarksScreen";
import QuizDetailScreen from "@/screens/assessment/QuizDetailScreen";
import QuizScreen from "@/screens/assessment/QuizScreen";
import QuizResultScreen from "@/screens/assessment/QuizResultScreen";
import AssignmentScreen from "@/screens/assessment/AssignmentScreen";
import ProjectScreen from "@/screens/assessment/ProjectScreen";
import ProjectSubmissionScreen from "@/screens/assessment/ProjectSubmissionScreen";
import DownloadsScreen from "@/screens/progress/DownloadsScreen";
import OfflineManagerScreen from "@/screens/progress/OfflineManagerScreen";
import CertificatesScreen from "@/screens/certification/CertificatesScreen";
import CertificateDetailScreen from "@/screens/certification/CertificateDetailScreen";
import CertificateVerificationScreen from "@/screens/certification/CertificateVerificationScreen";
import LearningRoadmapScreen from "@/screens/gamification/LearningRoadmapScreen";
import StreaksScreen from "@/screens/gamification/StreaksScreen";
import AchievementsScreen from "@/screens/gamification/AchievementsScreen";
import NotificationsScreen from "@/screens/community/NotificationsScreen";
import PostDetailScreen from "@/screens/community/PostDetailScreen";
import CreatePostScreen from "@/screens/community/CreatePostScreen";
import SettingsScreen from "@/screens/account/SettingsScreen";
import AppearanceScreen from "@/screens/account/AppearanceScreen";
import AccountSecurityScreen from "@/screens/account/AccountSecurityScreen";
import SupportScreen from "@/screens/account/SupportScreen";
import AboutScreen from "@/screens/account/AboutScreen";
import SocialLinksScreen from "@/screens/home/SocialLinksScreen";
import PYQScreen from "@/screens/home/PYQScreen";
import YouTubeSubjectsScreen from "@/screens/home/YouTubeSubjectsScreen";
import YouTubeChaptersScreen from "@/screens/home/YouTubeChaptersScreen";
import YouTubePlayerScreen from "@/screens/home/YouTubePlayerScreen";
import QuizzesHubScreen from "@/screens/home/QuizzesHubScreen";
import TestsScreen from "@/screens/home/TestsScreen";
import NotesScreen from "@/screens/home/NotesScreen";
import HandwrittenNotesScreen from "@/screens/home/HandwrittenNotesScreen";
import HandwrittenNotesChaptersScreen from "@/screens/home/HandwrittenNotesChaptersScreen";
import HandwrittenNotesPDFsScreen from "@/screens/home/HandwrittenNotesPDFsScreen";
import ImpQuestionsScreen from "@/screens/home/ImpQuestionsScreen";
import ImpQuestionChaptersScreen from "@/screens/home/ImpQuestionChaptersScreen";
import ImpQuestionPDFsScreen from "@/screens/home/ImpQuestionPDFsScreen";
import PrivacyPolicyScreen from "@/screens/account/PrivacyPolicyScreen";
import TermsConditionsScreen from "@/screens/account/TermsConditionsScreen";
import AiMentorScreen from "@/screens/advanced/AiMentorScreen";
import LearningAnalyticsScreen from "@/screens/advanced/LearningAnalyticsScreen";
import SubscriptionScreen from "@/screens/advanced/SubscriptionScreen";
import ErrorOfflineScreen from "@/screens/advanced/ErrorOfflineScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { resolved, colors, brand } = useTheme();
  const { isAuthenticated, isHydrated, isAdmin, hydrate } = useAuthStore();
  const hydrateClass = useStudentClassStore((s) => s.hydrate);
  const hydrateDownloads = useDownloadsStore((s) => s.hydrate);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    hydrate();
    hydrateClass();
    hydrateDownloads();
    const timer = setTimeout(() => setSplashDone(true), 2500);
    return () => clearTimeout(timer);
  }, [hydrate, hydrateClass, hydrateDownloads]);

  const navTheme = {
    ...(resolved === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(resolved === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background, card: colors.surface, text: colors.text,
      border: colors.border, primary: brand.primary,
    },
  };

  if (!splashDone || !isHydrated) {
    return (
      <NavigationContainer theme={navTheme}>
        <SplashScreen />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: true, headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text }}>
        {!isAuthenticated ? (
          <Stack.Screen name="AuthStack" component={AuthNavigator} options={{ headerShown: false }} />
        ) : isAdmin ? (
          // ── ADMIN PANEL ── shown to super_admin / admin / content_manager / finance / support
          <>
            <Stack.Screen name="AdminStack" component={AdminNavigator} options={{ headerShown: false }} />
          </>
        ) : (
          // ── STUDENT APP ──
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="SelectCategory" component={SelectCategoryScreen} options={{ title: "Select Category" }} />
            <Stack.Screen name="CategoryContent" component={CategoryContentScreen} options={{ title: "" }} />
            <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} options={{ title: "" }} />
            <Stack.Screen name="Curriculum" component={CurriculumScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="PaymentResult" component={PaymentResultScreen} options={{ headerShown: false }} />
            <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} options={{ title: "" }} />
            <Stack.Screen name="ProtectedVideoStatus" component={ProtectedVideoStatusScreen} />
            <Stack.Screen name="LessonResources" component={LessonResourcesScreen} />
            <Stack.Screen name="PdfViewer" component={PdfViewerScreen} options={({ route }) => ({ title: route.params.title })} />
            <Stack.Screen name="SourceCodeViewer" component={SourceCodeViewerScreen} options={({ route }) => ({ title: route.params.title })} />
            <Stack.Screen name="TemplateLibrary" component={TemplateLibraryScreen} />
            <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
            <Stack.Screen name="QuizDetail" component={QuizDetailScreen} options={{ title: "Quiz Details" }} />
            <Stack.Screen name="Quiz" component={QuizScreen} options={{ headerShown: false }} />
            <Stack.Screen name="QuizResult" component={QuizResultScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Assignment" component={AssignmentScreen} />
            <Stack.Screen name="Project" component={ProjectScreen} />
            <Stack.Screen name="ProjectSubmission" component={ProjectSubmissionScreen} />
            <Stack.Screen name="Downloads" component={DownloadsScreen} />
            <Stack.Screen name="OfflineManager" component={OfflineManagerScreen} />
            <Stack.Screen name="Certificates" component={CertificatesScreen} />
            <Stack.Screen name="CertificateDetail" component={CertificateDetailScreen} />
            <Stack.Screen name="CertificateVerification" component={CertificateVerificationScreen} />
            <Stack.Screen name="LearningRoadmap" component={LearningRoadmapScreen} />
            <Stack.Screen name="Streaks" component={StreaksScreen} />
            <Stack.Screen name="Achievements" component={AchievementsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: "Notifications" }} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="CreatePost" component={CreatePostScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Appearance" component={AppearanceScreen} />
            <Stack.Screen name="AccountSecurity" component={AccountSecurityScreen} />
            <Stack.Screen name="Support" component={SupportScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="SocialLinks" component={SocialLinksScreen} options={{ title: "Follow Us" }} />
            <Stack.Screen name="PYQHub" component={PYQScreen} options={{ title: "PYQ Papers" }} />
            <Stack.Screen name="YouTubeSubjects" component={YouTubeSubjectsScreen} options={{ title: "YouTube Lectures" }} />
            <Stack.Screen name="YouTubeChapters" component={YouTubeChaptersScreen} options={{ title: "" }} />
            <Stack.Screen name="YouTubePlayer" component={YouTubePlayerScreen} options={{ headerShown: false }} />
            <Stack.Screen name="QuizzesHub" component={QuizzesHubScreen} options={{ title: "Quizzes" }} />
            <Stack.Screen name="Tests" component={TestsScreen} options={{ title: "Tests" }} />
            <Stack.Screen name="Notes" component={NotesScreen} options={{ title: "Notes" }} />
            <Stack.Screen name="HandwrittenNotes" component={HandwrittenNotesScreen} options={{ title: "Handwritten Notes" }} />
            <Stack.Screen name="HandwrittenNoteChapters" component={HandwrittenNotesChaptersScreen} options={{ title: "" }} />
            <Stack.Screen name="HandwrittenNotePDFs" component={HandwrittenNotesPDFsScreen} options={{ title: "" }} />
            <Stack.Screen name="ImpQuestions" component={ImpQuestionsScreen} options={{ title: "Important Questions" }} />
            <Stack.Screen name="ImpQuestionChapters" component={ImpQuestionChaptersScreen} options={{ title: "" }} />
            <Stack.Screen name="ImpQuestionPDFs" component={ImpQuestionPDFsScreen} options={{ title: "" }} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
            <Stack.Screen name="AiMentor" component={AiMentorScreen} />
            <Stack.Screen name="LearningAnalytics" component={LearningAnalyticsScreen} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} />
            <Stack.Screen name="ErrorOffline" component={ErrorOfflineScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
