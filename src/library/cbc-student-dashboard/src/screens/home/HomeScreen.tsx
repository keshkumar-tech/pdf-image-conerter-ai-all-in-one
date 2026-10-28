import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { HomeDrawer } from "@/components/home/HomeDrawer";
import { HomeFeatureCard } from "@/components/home/HomeFeatureCard";
import { CoursesBannerSlider } from "@/components/home/CoursesBannerSlider";
import { Screen } from "@/components/Screen";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { useAuthStore } from "@/store/authStore";
import { useStudentClassStore } from "@/store/studentClassStore";
import { coursesApi, faqApi, notificationsApi } from "@/services/resources";
import { apiClient } from "@/services/apiClient";
import { filterCoursesByClass } from "@/store/studentClassStore";
import type { Course, FAQ, NotificationItem } from "@/services/types";
import type { CategoryType, MainTabParamList, RootStackParamList } from "@/navigation/types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "HomeTab">,
  NativeStackScreenProps<RootStackParamList>
>;

const CLASS_MAP: Record<string, string> = {
  "CLASS 9th": "Class 9",
  "CLASS 10th": "Class 10",
  "CLASS 11th": "Class 11",
  "CLASS 12th": "Class 12",
};

const FEATURE_CARDS: {
  key: CategoryType | "social" | "pyq" | "youtube" | "quizzes" | "tests" | "notes" | "handwritten-notes" | "imp-questions";
  icon: string;
  label: string;
  accent: string;
  suffix: string;
}[] = [
  { key: "paid", icon: "💻", label: "Paid Course", accent: "#1B2B4B", suffix: "Courses" },
  { key: "free", icon: "▶️", label: "Free Courses", accent: "#12B76A", suffix: "Courses" },
  { key: "ncert", icon: "📕", label: "NCERT Book", accent: "#C9A227", suffix: "Books" },
  { key: "tests", icon: "📝", label: "Tests", accent: "#F79009", suffix: "Tests" },
  { key: "notes", icon: "📋", label: "Notes", accent: "#7A5AF8", suffix: "Notes" },
  { key: "handwritten-notes", icon: "✍️", label: "Handwritten Notes", accent: "#059669", suffix: "Subjects" },
  { key: "live", icon: "🔴", label: "Live Class", accent: "#F04438", suffix: "Live" },
  { key: "social", icon: "🔗", label: "Social Links", accent: "#667085", suffix: "Links" },
  { key: "pyq", icon: "📄", label: "PYQ Papers", accent: "#0EA5E9", suffix: "Papers" },
  { key: "youtube", icon: "▶️", label: "YouTube", accent: "#FF0000", suffix: "Videos" },
  { key: "quizzes", icon: "🧠", label: "Quizzes", accent: "#7C3AED", suffix: "Quizzes" },
  { key: "imp-questions", icon: "⭐", label: "Imp Questions", accent: "#EF4444", suffix: "Subjects" },
];

// FAQ data now loaded dynamically from API — see faqItems state below


// ─── Feedback ─────────────────────────────────────────────────────────────────

interface Feedback {
  id: string;
  name: string;
  rating: number;
  comment: string;
  avatar: string;
}

const DUMMY_FEEDBACKS: Feedback[] = [
  { id: "1", name: "Rahul Verma", rating: 5, comment: "Best app for UP Board preparation! The Hindi medium content is very clear and easy to understand.", avatar: "R" },
  { id: "2", name: "Priya Sharma", rating: 5, comment: "SHAKTI batch changed my preparation completely. The live classes are interactive and the notes are excellent.", avatar: "P" },
  { id: "3", name: "Amit Yadav", rating: 4, comment: "Very helpful app. I love the chapter-wise tests. Would be great to have more mock papers.", avatar: "A" },
  { id: "4", name: "Sunita Gupta", rating: 5, comment: "Downloaded the app and enrolled in Class 12 Maths. The teacher explains very well with real examples.", avatar: "S" },
];

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function HomeScreen({ navigation }: Props) {
  const { colors, brand, radius, resolved } = useTheme();
  const isDark = resolved === "dark";
  const user = useAuthStore((s) => s.user);
  const selectedClass = useStudentClassStore((s) => s.selectedClass);
  const [featured, setFeatured] = useState<Course | null>(null);
  const [sliderCourses, setSliderCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [faqItems, setFaqItems] = useState<FAQ[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    faqApi.list({ is_active: true }).then((res) => setFaqItems(res.results)).catch(() => {});
  }, []);

  useEffect(() => {
    notificationsApi.list()
      .then((res) => {
        const unread = (res.results ?? []).filter((n: NotificationItem) => !n.is_read).length;
        setUnreadNotifications(unread);
      })
      .catch(() => {});
  }, []);

  // Feedback state
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(DUMMY_FEEDBACKS);
  const [feedName, setFeedName] = useState("");
  const [feedRating, setFeedRating] = useState(0);
  const [feedComment, setFeedComment] = useState("");
  const [feedSubmitted, setFeedSubmitted] = useState(false);
  const feedScrollRef = useRef<ScrollView>(null);

  // Dashboard Item Counts
  const [counts, setCounts] = useState<Record<string, number>>({});

  const loadCounts = useCallback(async () => {
    try {
      const currentClassLevel = CLASS_MAP[selectedClass] ?? "Class 10";
      const res = await apiClient.get<Record<string, number>>("/content/dashboard-counts/", {
        params: { class_level: currentClassLevel },
      });
      if (res.data) {
        setCounts(res.data);
      }
    } catch {
      // Fallback silently if offline
    }
  }, [selectedClass]);

  useFocusEffect(
    useCallback(() => {
      loadCounts();
    }, [loadCounts])
  );

  const load = () => {
    setIsLoading(true);
    setError(null);
    loadCounts();
    coursesApi.list({ is_published: true })
      .then((res) => {
        const filtered = filterCoursesByClass(res.results, selectedClass);
        setSliderCourses(filtered.length > 0 ? filtered : res.results);
        setFeatured(filtered[0] ?? res.results[0] ?? null);
      })
      .catch(() => setError("Couldn't load home."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [selectedClass]);

  const handleDrawerNavigate = (screen: string) => {
    const tabs = ["HomeTab", "CoursesTab", "MyCoursesTab", "DownloadsTab", "AskDoubtsTab", "WhatsappTab"];
    if (tabs.includes(screen)) {
      navigation.navigate("MainTabs", { screen: screen as keyof MainTabParamList });
      return;
    }
    const stackRoutes = ["Settings", "Subscription", "LearningAnalytics", "Support", "About", "Notifications"] as const;
    if ((stackRoutes as readonly string[]).includes(screen)) {
      navigation.navigate(screen as typeof stackRoutes[number]);
    }
  };

  const submitFeedback = () => {
    if (!feedName.trim() || feedRating === 0 || !feedComment.trim()) return;
    const newFb: Feedback = {
      id: Date.now().toString(),
      name: feedName.trim(),
      rating: feedRating,
      comment: feedComment.trim(),
      avatar: feedName.trim()[0].toUpperCase(),
    };
    setFeedbacks((prev) => [newFb, ...prev]);
    setFeedName("");
    setFeedRating(0);
    setFeedComment("");
    setFeedSubmitted(true);
    setTimeout(() => setFeedSubmitted(false), 3000);
  };

  if (isLoading) return <Screen><LoadingState label="Loading..." /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={load} /></Screen>;

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "left", "right"]}>
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.background }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
        {/* ── Top Bar ── */}
        <View style={[styles.topBar, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
          {/* On web the drawer is now a permanent left sidebar, so the
              hamburger is only shown on native. */}
          {Platform.OS !== "web" && (
            <Pressable onPress={() => setDrawerOpen(true)} style={styles.iconBtn} hitSlop={8}>
              <AppText style={[styles.menuIcon, { color: colors.text }]}>☰</AppText>
            </Pressable>
          )}
          <Pressable
            onPress={() => navigation.navigate("SelectCategory")}
            style={[styles.classPill, { borderColor: colors.border, borderRadius: radius.pill }]}
          >
            <AppText style={{ fontWeight: "700", fontSize: 13, color: colors.text }}>{selectedClass}</AppText>
            <AppText style={{ fontSize: 10, marginLeft: 4, color: colors.muted }}>▼</AppText>
          </Pressable>
          <Pressable onPress={() => navigation.navigate("Notifications")} style={styles.iconBtn} hitSlop={8}>
            <AppText style={{ fontSize: 20 }}>🔔</AppText>
            {unreadNotifications > 0 && (
              <View style={styles.badge}>
                <AppText style={styles.badgeText}>{unreadNotifications > 99 ? "99+" : unreadNotifications}</AppText>
              </View>
            )}
          </Pressable>
        </View>

        <View style={{ padding: 16 }}>
          {/* ── Greeting ── */}
          <AppText style={{ fontSize: 15, marginBottom: 14, color: colors.text }}>
            Hello, <AppText style={{ fontWeight: "700", color: colors.text }}>{user?.username || "Student"}</AppText>
          </AppText>

          {/* ── Courses Banner Slider ── */}
          <CoursesBannerSlider
            courses={sliderCourses}
            onCoursePress={(course) => {
              navigation.navigate("CourseDetails", { courseId: course.id });
            }}
          />

          {/* ── Feature Grid ── */}
          <View style={styles.grid}>
            {FEATURE_CARDS.map((card, index) => {
              const countVal = counts[card.key];
              return (
                <View key={card.key} style={[styles.gridItem, index % 3 !== 2 && { marginRight: 10 }]}>
                  <HomeFeatureCard
                    icon={card.icon}
                    label={card.label}
                    accent={card.accent}
                    count={countVal !== undefined ? countVal : null}
                    countSuffix={card.suffix}
                    onPress={() => {
                      if (card.key === "social") {
                        navigation.navigate("SocialLinks");
                      } else if (card.key === "pyq") {
                        navigation.navigate("PYQHub");
                      } else if (card.key === "youtube") {
                        navigation.navigate("YouTubeSubjects");
                      } else if (card.key === "quizzes") {
                        navigation.navigate("QuizzesHub");
                      } else if (card.key === "tests") {
                        navigation.navigate("Tests");
                      } else if (card.key === "notes") {
                        navigation.navigate("Notes");
                      } else if (card.key === "handwritten-notes") {
                        navigation.navigate("HandwrittenNotes");
                      } else if (card.key === "imp-questions") {
                        navigation.navigate("ImpQuestions");
                      } else {
                        navigation.navigate("CategoryContent", { type: card.key as CategoryType });
                      }
                    }}
                  />
                </View>
              );
            })}
          </View>

          {/* ═══════════════════════════════════════════
              FAQ SECTION
          ═══════════════════════════════════════════ */}
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            <AppText style={[styles.sectionTitle, { color: colors.text }]}>❓ Frequently Asked Questions</AppText>

            {faqItems.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <View key={faq.id} style={[styles.faqItem, { borderTopColor: colors.border }]}>
                  <Pressable
                    onPress={() => setOpenFaq(isOpen ? null : idx)}
                    style={styles.faqQuestion}
                  >
                    <AppText style={[styles.faqQText, { color: colors.text, flex: 1 }]}>{faq.question}</AppText>
                    <AppText style={[styles.faqChevron, { color: brand.secondary }]}>
                      {isOpen ? "▲" : "▼"}
                    </AppText>
                  </Pressable>
                  {isOpen && (
                    <View style={[styles.faqAnswer, { backgroundColor: isDark ? "#1a2236" : "#F8F9FF" }]}>
                      <AppText style={[styles.faqAText, { color: colors.muted }]}>{faq.answer}</AppText>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* ═══════════════════════════════════════════
              FEEDBACK SECTION
          ═══════════════════════════════════════════ */}
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            <AppText style={[styles.sectionTitle, { color: colors.text }]}>💬 Student Feedback</AppText>
            <AppText style={[styles.sectionSub, { color: colors.muted }]}>
              Share your experience with Concept Builder Classes
            </AppText>

            {/* Feedback Slider */}
            <ScrollView
              ref={feedScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 12, paddingRight: 8, paddingLeft: 16 }}
              style={{ marginHorizontal: -16 }}
            >
              {feedbacks.map((fb) => (
                <View
                  key={fb.id}
                  style={[
                    styles.fbCard,
                    {
                      backgroundColor: isDark ? "#1a2236" : "#F0F4FF",
                      borderColor: colors.border,
                      borderRadius: radius.lg,
                      width: SCREEN_WIDTH * 0.72,
                      marginRight: 12,
                    },
                  ]}
                >
                  {/* Avatar + Name */}
                  <View style={styles.fbTop}>
                    <View style={[styles.fbAvatar, { backgroundColor: brand.primary }]}>
                      <AppText style={styles.fbAvatarText}>{fb.avatar}</AppText>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <AppText style={[styles.fbName, { color: colors.text }]}>{fb.name}</AppText>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <AppText key={s} style={[styles.starIcon, { color: s <= fb.rating ? "#F79009" : colors.border }]}>★</AppText>
                        ))}
                      </View>
                    </View>
                  </View>
                  <AppText style={[styles.fbComment, { color: colors.muted }]} numberOfLines={4}>
                    "{fb.comment}"
                  </AppText>
                </View>
              ))}
            </ScrollView>

            {/* Add Feedback Form */}
            <View style={[styles.fbForm, { borderTopColor: colors.border }]}>
              <AppText style={[styles.fbFormTitle, { color: colors.text }]}>Add Your Review</AppText>

              {/* Star rating picker */}
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Pressable key={s} onPress={() => setFeedRating(s)} hitSlop={6}>
                    <AppText style={[styles.starPickerIcon, { color: s <= feedRating ? "#F79009" : colors.border }]}>★</AppText>
                  </Pressable>
                ))}
                {feedRating > 0 && (
                  <AppText style={[styles.ratingLabel, { color: colors.muted }]}>
                    {["", "Poor", "Fair", "Good", "Great", "Excellent!"][feedRating]}
                  </AppText>
                )}
              </View>

              {/* Name input */}
              <TextInput
                value={feedName}
                onChangeText={setFeedName}
                placeholder="Your name"
                placeholderTextColor={colors.muted}
                style={[
                  styles.fbInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                    borderRadius: radius.md,
                  },
                ]}
              />

              {/* Comment input */}
              <TextInput
                value={feedComment}
                onChangeText={setFeedComment}
                placeholder="Share your experience..."
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={3}
                style={[
                  styles.fbInput,
                  styles.fbTextarea,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                    borderRadius: radius.md,
                  },
                ]}
              />

              {/* Submit */}
              {feedSubmitted ? (
                <View style={[styles.fbSuccess, { backgroundColor: "#12B76A22" }]}>
                  <AppText style={{ color: "#12B76A", fontWeight: "700", textAlign: "center" }}>
                    ✅ Thank you for your feedback!
                  </AppText>
                </View>
              ) : (
                <Pressable
                  onPress={submitFeedback}
                  style={({ pressed }) => [
                    styles.fbSubmitBtn,
                    { backgroundColor: brand.primary, borderRadius: radius.md, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <AppText style={styles.fbSubmitText}>Submit Review</AppText>
                </Pressable>
              )}
            </View>
          </View>

        </View>
        </ScrollView>
      </SafeAreaView>

      <HomeDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} onNavigate={handleDrawerNavigate} />
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconBtn: { width: 36, alignItems: "center" },
  menuIcon: { fontSize: 22, fontWeight: "700" },
  badge: { position: "absolute", top: -4, right: -4, backgroundColor: "#EF4444", borderRadius: 10, minWidth: 18, height: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  classPill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  banner: { height: 148, marginBottom: 18 },
  bannerImage: { width: "100%", height: "100%" },
  bannerFallback: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  gridItem: { width: "31%", marginBottom: 10 },

  // ── Shared section card
  sectionCard: {
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  sectionTitle: { fontSize: 17, fontWeight: "800", padding: 16, paddingBottom: 8 },
  sectionSub: { fontSize: 12, paddingHorizontal: 16, marginBottom: 4 },

  // ── FAQ
  faqItem: { borderTopWidth: 1 },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  faqQText: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  faqChevron: { fontSize: 12, fontWeight: "700" },
  faqAnswer: { paddingHorizontal: 16, paddingBottom: 14, paddingTop: 4 },
  faqAText: { fontSize: 13, lineHeight: 20 },

  // ── Feedback cards
  fbCard: {
    padding: 14,
    borderWidth: 1,
  },
  fbTop: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  fbAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  fbAvatarText: { color: "#fff", fontWeight: "800", fontSize: 18 },
  fbName: { fontSize: 14, fontWeight: "700" },
  starsRow: { flexDirection: "row", alignItems: "center", marginTop: 2, gap: 2 },
  starIcon: { fontSize: 14 },
  fbComment: { fontSize: 13, lineHeight: 19, fontStyle: "italic" },

  // ── Feedback form
  fbForm: { borderTopWidth: 1, padding: 16, gap: 10 },
  fbFormTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  starPickerIcon: { fontSize: 30 },
  ratingLabel: { fontSize: 13, marginLeft: 6, fontWeight: "600" },
  fbInput: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  fbTextarea: { textAlignVertical: "top", minHeight: 80, paddingTop: 10 },
  fbSuccess: { padding: 14, borderRadius: 10 },
  fbSubmitBtn: {
    paddingVertical: 14,
    alignItems: "center",
  },
  fbSubmitText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
