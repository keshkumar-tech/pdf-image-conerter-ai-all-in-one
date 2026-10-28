import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text, Keyboard, Platform } from "react-native";
import { useEffect, useState } from "react";
import { useTheme } from "@/theme/ThemeProvider";
import type { AdminStackParamList } from "./adminTypes";

import AdminDashboardScreen       from "@/screens/admin/AdminDashboardScreen";
import AdminCoursesScreen         from "@/screens/admin/AdminCoursesScreen";
import AdminStudentsScreen        from "@/screens/admin/AdminStudentsScreen";
import AdminOrdersScreen          from "@/screens/admin/AdminOrdersScreen";
import AdminSettingsScreen        from "@/screens/admin/AdminSettingsScreen";
import AdminContentScreen         from "@/screens/admin/AdminContentScreen";
import AdminCourseFormScreen      from "@/screens/admin/AdminCourseFormScreen";
import AdminCurriculumScreen      from "@/screens/admin/AdminCurriculumScreen";
import AdminStudentDetailScreen   from "@/screens/admin/AdminStudentDetailScreen";
import AdminPYQScreen             from "@/screens/admin/AdminPYQScreen";
import AdminPYQFormScreen         from "@/screens/admin/AdminPYQFormScreen";
import AdminYouTubeScreen         from "@/screens/admin/AdminYouTubeScreen";
import AdminYouTubeSubjectFormScreen  from "@/screens/admin/AdminYouTubeSubjectFormScreen";
import AdminYouTubeChaptersScreen from "@/screens/admin/AdminYouTubeChaptersScreen";
import AdminYouTubeChapterFormScreen  from "@/screens/admin/AdminYouTubeChapterFormScreen";
import AdminYouTubeVideoFormScreen    from "@/screens/admin/AdminYouTubeVideoFormScreen";
import AdminSocialLinksScreen     from "@/screens/admin/AdminSocialLinksScreen";
import AdminSocialLinkFormScreen  from "@/screens/admin/AdminSocialLinkFormScreen";
import AdminFAQScreen             from "@/screens/admin/AdminFAQScreen";
import AdminFAQFormScreen         from "@/screens/admin/AdminFAQFormScreen";
import AdminNotificationsScreen   from "@/screens/admin/AdminNotificationsScreen";
import AdminCouponsScreen         from "@/screens/admin/AdminCouponsScreen";
import AdminCouponFormScreen      from "@/screens/admin/AdminCouponFormScreen";
import AdminMaterialsScreen       from "@/screens/admin/AdminMaterialsScreen";
import AdminMaterialFormScreen    from "@/screens/admin/AdminMaterialFormScreen";
import AdminQuizzesScreen         from "@/screens/admin/AdminQuizzesScreen";
import AdminQuizFormScreen        from "@/screens/admin/AdminQuizFormScreen";
import AdminModuleLessonsScreen   from "@/screens/admin/AdminModuleLessonsScreen";
import AdminHandwrittenNotesScreen from "@/screens/admin/AdminHandwrittenNotesScreen";
import AdminHandwrittenNotesSubjectFormScreen from "@/screens/admin/AdminHandwrittenNotesSubjectFormScreen";
import AdminHandwrittenNotesChaptersScreen from "@/screens/admin/AdminHandwrittenNotesChaptersScreen";
import AdminHandwrittenNotesChapterFormScreen from "@/screens/admin/AdminHandwrittenNotesChapterFormScreen";
import AdminHandwrittenNotesPDFsScreen from "@/screens/admin/AdminHandwrittenNotesPDFsScreen";
import AdminHandwrittenNotesPDFFormScreen from "@/screens/admin/AdminHandwrittenNotesPDFFormScreen";
import AdminImpQuestionsScreen from "@/screens/admin/AdminImpQuestionsScreen";
import AdminImpQuestionsSubjectFormScreen from "@/screens/admin/AdminImpQuestionsSubjectFormScreen";
import AdminImpQuestionsChaptersScreen from "@/screens/admin/AdminImpQuestionsChaptersScreen";
import AdminImpQuestionsChapterFormScreen from "@/screens/admin/AdminImpQuestionsChapterFormScreen";
import AdminImpQuestionsPDFsScreen from "@/screens/admin/AdminImpQuestionsPDFsScreen";
import AdminImpQuestionsPDFFormScreen from "@/screens/admin/AdminImpQuestionsPDFFormScreen";

// ─── Tab types ────────────────────────────────────────────────────────────────
type AdminTabParamList = {
  AdminDashboard: undefined;
  AdminCourses:   undefined;
  AdminStudents:  undefined;
  AdminOrders:    undefined;
  AdminContent:   undefined;
  AdminSettings:  undefined;
};

const Tab   = createBottomTabNavigator<AdminTabParamList>();
const Stack = createNativeStackNavigator<AdminStackParamList>();

const TAB_ICONS: Record<keyof AdminTabParamList, string> = {
  AdminDashboard: "📊",
  AdminCourses:   "📚",
  AdminStudents:  "👨‍🎓",
  AdminOrders:    "🛒",
  AdminContent:   "📋",
  AdminSettings:  "⚙️",
};

const TAB_LABELS: Record<keyof AdminTabParamList, string> = {
  AdminDashboard: "Dashboard",
  AdminCourses:   "Courses",
  AdminStudents:  "Students",
  AdminOrders:    "Orders",
  AdminContent:   "Content",
  AdminSettings:  "Settings",
};

// ─── Bottom tab navigator ─────────────────────────────────────────────────────
function AdminTabs() {
  const { colors, brand } = useTheme();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", () => setKeyboardVisible(true));
    const hide = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",  () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: brand.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: keyboardVisible
          ? { display: "none" }
          : { backgroundColor: colors.surface, borderTopColor: colors.border, height: 60, paddingBottom: 6 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 18, color: focused ? brand.primary : colors.muted }}>
            {TAB_ICONS[route.name as keyof AdminTabParamList]}
          </Text>
        ),
        tabBarLabel: TAB_LABELS[route.name as keyof AdminTabParamList],
      })}
    >
      <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="AdminCourses"   component={AdminCoursesScreen} />
      <Tab.Screen name="AdminStudents"  component={AdminStudentsScreen} />
      <Tab.Screen name="AdminOrders"    component={AdminOrdersScreen} />
      <Tab.Screen name="AdminContent"   component={AdminContentScreen} />
      <Tab.Screen name="AdminSettings"  component={AdminSettingsScreen} />
    </Tab.Navigator>
  );
}

// ─── Root stack navigator (tabs + push screens) ───────────────────────────────
export function AdminNavigator() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
      }}
    >
      {/* ── Main tabs ── */}
      <Stack.Screen name="AdminTabs" component={AdminTabs} />

      {/* ── Courses ── */}
      <Stack.Screen name="AdminCourseForm"       component={AdminCourseFormScreen}       options={{ headerShown: true, title: "Course" }} />
      <Stack.Screen name="AdminCurriculum"       component={AdminCurriculumScreen}       options={{ headerShown: true, title: "Curriculum" }} />
      <Stack.Screen name="AdminModuleLessons"    component={AdminModuleLessonsScreen}    options={{ headerShown: true, title: "Lessons" }} />

      {/* ── Students ── */}
      <Stack.Screen name="AdminStudentDetail" component={AdminStudentDetailScreen} options={{ headerShown: true, title: "Student" }} />

      {/* ── Content hub ── */}
      <Stack.Screen name="AdminContent"      component={AdminContentScreen}      options={{ headerShown: true, title: "Content Manager" }} />

      {/* ── PYQ ── */}
      <Stack.Screen name="AdminPYQ"          component={AdminPYQScreen}          options={{ headerShown: true, title: "PYQ Papers" }} />
      <Stack.Screen name="AdminPYQForm"      component={AdminPYQFormScreen}      options={{ headerShown: true, title: "PYQ Paper" }} />

      {/* ── YouTube ── */}
      <Stack.Screen name="AdminYouTube"               component={AdminYouTubeScreen}              options={{ headerShown: true, title: "YouTube" }} />
      <Stack.Screen name="AdminYouTubeSubjectForm"    component={AdminYouTubeSubjectFormScreen}   options={{ headerShown: true, title: "Subject" }} />
      <Stack.Screen name="AdminYouTubeChapters"       component={AdminYouTubeChaptersScreen}      options={{ headerShown: true, title: "Chapters" }} />
      <Stack.Screen name="AdminYouTubeChapterForm"    component={AdminYouTubeChapterFormScreen}   options={{ headerShown: true, title: "Chapter" }} />
      <Stack.Screen name="AdminYouTubeVideoForm"      component={AdminYouTubeVideoFormScreen}     options={{ headerShown: true, title: "Video" }} />

      {/* ── Social Links ── */}
      <Stack.Screen name="AdminSocialLinks"  component={AdminSocialLinksScreen}  options={{ headerShown: true, title: "Social Links" }} />
      <Stack.Screen name="AdminSocialLinkForm" component={AdminSocialLinkFormScreen} options={{ headerShown: true, title: "Social Link" }} />

      {/* ── FAQ ── */}
      <Stack.Screen name="AdminFAQ"          component={AdminFAQScreen}          options={{ headerShown: true, title: "FAQs" }} />
      <Stack.Screen name="AdminFAQForm"      component={AdminFAQFormScreen}      options={{ headerShown: true, title: "FAQ" }} />

      {/* ── Notifications ── */}
      <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} options={{ headerShown: true, title: "Notifications" }} />

      {/* ── Coupons ── */}
      <Stack.Screen name="AdminCoupons"      component={AdminCouponsScreen}      options={{ headerShown: true, title: "Coupons" }} />
      <Stack.Screen name="AdminCouponForm"   component={AdminCouponFormScreen}   options={{ headerShown: true, title: "Coupon" }} />

      {/* ── Study Materials ── */}
      <Stack.Screen name="AdminMaterials"     component={AdminMaterialsScreen}    options={{ headerShown: true }} />
      <Stack.Screen name="AdminMaterialForm"  component={AdminMaterialFormScreen} options={{ headerShown: true }} />

      {/* ── Quizzes ── */}
      <Stack.Screen name="AdminQuizzes"       component={AdminQuizzesScreen}      options={{ headerShown: true, title: "Quizzes" }} />
      <Stack.Screen name="AdminQuizForm"      component={AdminQuizFormScreen}     options={{ headerShown: true, title: "Quiz Form" }} />

      {/* ── Handwritten Notes ── */}
      <Stack.Screen name="AdminHandwrittenNotes" component={AdminHandwrittenNotesScreen} options={{ headerShown: true, title: "Handwritten Notes" }} />
      <Stack.Screen name="AdminHandwrittenNotesSubjectForm" component={AdminHandwrittenNotesSubjectFormScreen} options={{ headerShown: true, title: "Subject" }} />
      <Stack.Screen name="AdminHandwrittenNotesChapters" component={AdminHandwrittenNotesChaptersScreen} options={{ headerShown: true, title: "Chapters" }} />
      <Stack.Screen name="AdminHandwrittenNotesChapterForm" component={AdminHandwrittenNotesChapterFormScreen} options={{ headerShown: true, title: "Chapter" }} />
      <Stack.Screen name="AdminHandwrittenNotesPDFs" component={AdminHandwrittenNotesPDFsScreen} options={{ headerShown: true, title: "Notes / PDFs" }} />
      <Stack.Screen name="AdminHandwrittenNotesPDFForm" component={AdminHandwrittenNotesPDFFormScreen} options={{ headerShown: true, title: "Note / PDF" }} />

      {/* ── Important Questions ── */}
      <Stack.Screen name="AdminImpQuestions" component={AdminImpQuestionsScreen} options={{ headerShown: true, title: "Important Questions" }} />
      <Stack.Screen name="AdminImpQuestionsSubjectForm" component={AdminImpQuestionsSubjectFormScreen} options={{ headerShown: true, title: "Subject" }} />
      <Stack.Screen name="AdminImpQuestionsChapters" component={AdminImpQuestionsChaptersScreen} options={{ headerShown: true, title: "Chapters" }} />
      <Stack.Screen name="AdminImpQuestionsChapterForm" component={AdminImpQuestionsChapterFormScreen} options={{ headerShown: true, title: "Chapter" }} />
      <Stack.Screen name="AdminImpQuestionsPDFs" component={AdminImpQuestionsPDFsScreen} options={{ headerShown: true, title: "PDFs" }} />
      <Stack.Screen name="AdminImpQuestionsPDFForm" component={AdminImpQuestionsPDFFormScreen} options={{ headerShown: true, title: "PDF" }} />
    </Stack.Navigator>
  );
}
