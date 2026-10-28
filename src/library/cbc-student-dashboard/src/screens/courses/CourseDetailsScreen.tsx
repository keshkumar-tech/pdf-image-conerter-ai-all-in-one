import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { CourseThumbnail } from "@/components/courses/CourseThumbnail";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { EmptyCatalogState } from "@/components/catalog/EmptyCatalogState";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { coursesApi, enrollmentsApi } from "@/services/resources";
import type { Course } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";
import {
  formatRupee,
  getBatchDates,
  getCourseHighlights,
  getCoursePriceInfo,
} from "@/utils/coursePricing";

type Props = NativeStackScreenProps<RootStackParamList, "CourseDetails">;
type DetailTab = "overview" | "content" | "live";

export default function CourseDetailsScreen({ route, navigation }: Props) {
  const { courseId } = route.params;
  const insets = useSafeAreaInsets();
  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [descExpanded, setDescExpanded] = useState(false);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);

    const fetchCourse = async () => {
      try {
        return await coursesApi.retrieve(courseId);
      } catch (err: any) {
        // Fallback: in case courseId is UUID and slug retrieval was expected, or vice versa, list and find
        try {
          const listRes = await coursesApi.list();
          const match = (listRes.results || []).find((c) => c.id === courseId || c.slug === courseId);
          if (match) return match;
        } catch {
          // ignore
        }
        throw err;
      }
    };

    Promise.all([
      fetchCourse(),
      enrollmentsApi.list().catch(() => ({ results: [] })),
    ])
      .then(([courseData, enrollments]) => {
        setCourse(courseData);
        setIsEnrolled(enrollments.results.some((e) => e.course === courseId || e.course === (courseData as any)?.id));
      })
      .catch((err) => {
        console.warn("Course load error:", err);
        setError("Couldn't load this course.");
      })
      .finally(() => setIsLoading(false));
  }, [courseId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const showEnrolledOptions = () => {
    Alert.alert("Enrolled!", "Course added to My Courses.", [
      { text: "Go to My Courses", onPress: () => navigation.navigate("MainTabs", { screen: "MyCoursesTab" }) },
      { text: "Start Learning", onPress: () => navigation.navigate("Curriculum", { courseId }) },
    ]);
  };

  const handleFreeEnroll = async () => {
    if (!course) return;
    setActionError(null);
    setIsEnrolling(true);
    try {
      await enrollmentsApi.create({ course: course.id });
      setIsEnrolled(true);
      showEnrolledOptions();
    } catch {
      setActionError("Couldn't enroll. Please try again.");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handlePurchase = () => {
    if (!course) return;
    navigation.navigate("Checkout", { courseId: course.id });
  };

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <LoadingState label="Loading course..." />
      </View>
    );
  }

  if (error || !course) {
    return (
      <View style={styles.screen}>
        <ErrorState message={error ?? "Course not found."} onRetry={load} />
      </View>
    );
  }

  const pricing = getCoursePriceInfo(course);
  const dates = getBatchDates(course);
  const highlights = getCourseHighlights(course);
  const description = course.description || course.short_description || "";
  const shortDesc = description.length > 220 && !descExpanded ? `${description.slice(0, 220)}...` : description;
  const batchName = course.batch_name || course.title;

  const ctaLabel = isEnrolled
    ? "Continue Learning"
    : course.is_free
      ? "Enroll for Free"
      : "Buy Now";

  const onCtaPress = () => {
    if (isEnrolled) navigation.navigate("Curriculum", { courseId });
    else if (course.is_free) handleFreeEnroll();
    else handlePurchase();
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <CourseThumbnail
          size="banner"
          type={course.is_free ? "free" : "paid"}
          uri={course.thumbnail_url}
          bannerUri={course.banner_url}
        />

        <View style={styles.tabRow}>
          {([
            ["overview", "Overview"],
            ["content", "Content"],
            ["live", "Live"],
          ] as [DetailTab, string][]).map(([key, label]) => (
            <Pressable
              key={key}
              onPress={() => setActiveTab(key)}
              style={[styles.tab, activeTab === key ? styles.tabActive : styles.tabInactive]}
            >
              <AppText style={[styles.tabText, activeTab === key && styles.tabTextActive]}>{label}</AppText>
            </Pressable>
          ))}
        </View>

        {activeTab === "overview" && (
          <View style={styles.section}>
            <AppText style={styles.courseTitle}>{course.title}</AppText>
            {!!course.batch_name && (
              <View style={styles.batchBadge}>
                <AppText style={styles.batchBadgeText}>📚 {course.batch_name}</AppText>
              </View>
            )}

            {!pricing.isFree && pricing.current != null && (
              <View style={styles.priceBlock}>
                <View style={styles.priceRow}>
                  <View style={styles.priceLeft}>
                    <AppText style={styles.currentPrice}>{formatRupee(pricing.current)}</AppText>
                    {pricing.original != null && (
                      <AppText style={styles.originalPrice}>{formatRupee(pricing.original)}</AppText>
                    )}
                  </View>
                  {pricing.discountPercent != null && (
                    <AppText style={styles.discount}>{pricing.discountPercent.toFixed(2)}% off</AppText>
                  )}
                </View>
                {dates && (
                  <>
                    <View style={styles.divider} />
                    <AppText style={styles.dates}>
                      Starts {dates.start} · Ends {dates.end}
                    </AppText>
                  </>
                )}
              </View>
            )}

            {pricing.isFree && (
              <View style={styles.priceBlock}>
                <AppText style={styles.freeBadge}>FREE COURSE</AppText>
                <AppText style={styles.currentPrice}>{formatRupee(0)}</AppText>
                {dates ? (
                  <AppText style={styles.dates}>Starts {dates.start} · Ends {dates.end}</AppText>
                ) : (
                  <AppText style={styles.dates}>Lifetime access · Start anytime</AppText>
                )}
              </View>
            )}

            {!!description && (
              <>
                <AppText style={styles.sectionHeading}>Description</AppText>
                <AppText style={styles.description}>{shortDesc}</AppText>
                {description.length > 220 && (
                  <Pressable onPress={() => setDescExpanded((v) => !v)}>
                    <AppText style={styles.readMore}>{descExpanded ? "Show Less" : "Read More"}</AppText>
                  </Pressable>
                )}
              </>
            )}

            {highlights.length > 0 && (
              <>
                <AppText style={[styles.sectionHeading, { marginTop: 12 }]}>What You'll Get</AppText>
                {highlights.map((line, i) => (
                  <AppText key={i} style={styles.bullet}>{line}</AppText>
                ))}
              </>
            )}

            <View style={styles.metaRow}>
              {course.rating_average > 0 && (
                <AppText style={styles.meta}>★ {course.rating_average}</AppText>
              )}
              {course.students_count > 0 && (
                <AppText style={styles.meta}>· {course.students_count} students</AppText>
              )}
              {!!course.instructor_name && (
                <AppText style={styles.meta}>· {course.instructor_name}</AppText>
              )}
            </View>
          </View>
        )}

        {activeTab === "content" && (
          <View style={styles.section}>
            <AppText style={styles.sectionHeading}>Course Content</AppText>
            <AppText style={styles.description}>
              {course.duration_minutes > 0
                ? `${Math.round(course.duration_minutes / 60)}+ hours of structured lessons, notes, and practice material.`
                : "Structured lessons, notes, and practice material included in this batch."}
            </AppText>
            {isEnrolled ? (
              <Pressable
                onPress={() => navigation.navigate("Curriculum", { courseId })}
                style={styles.secondaryBtn}
              >
                <AppText style={styles.secondaryBtnText}>Open Curriculum</AppText>
              </Pressable>
            ) : (
              <AppText style={styles.lockedNote}>Enroll to unlock all chapters and videos.</AppText>
            )}
          </View>
        )}

        {activeTab === "live" && (
          <EmptyCatalogState message="No live class scheduled right now" />
        )}

        {actionError ? <AppText style={styles.error}>{actionError}</AppText> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable
          onPress={onCtaPress}
          disabled={isEnrolling}
          style={({ pressed }) => [styles.buyBtn, pressed && { opacity: 0.9 }, isEnrolling && { opacity: 0.7 }]}
        >
          <AppText style={styles.buyBtnText}>{isEnrolling ? "Please wait..." : ctaLabel}</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  scroll: { paddingBottom: 32 },
  banner: { width: "100%", height: 210, backgroundColor: "#E4E7EC" },
  bannerFallback: {
    width: "100%",
    height: 210,
    backgroundColor: "#1B2B4B",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerFallbackText: { color: "#C9A227", fontWeight: "800", fontSize: 18 },
  tabRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  tab: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  tabActive: { backgroundColor: "#1B2B4B", borderColor: "#1B2B4B" },
  tabInactive: { backgroundColor: "#F9FAFB", borderColor: "#E4E7EC" },
  tabText: { fontWeight: "700", fontSize: 13, color: "#667085" },
  tabTextActive: { color: "#fff" },
  section: { paddingHorizontal: 16, paddingTop: 12 },
  courseTitle: {
    fontSize: 18, fontWeight: "800", lineHeight: 26, color: "#101828", marginBottom: 8,
  },
  batchBadge: {
    backgroundColor: "#C9A22720", borderRadius: 8, paddingHorizontal: 10,
    paddingVertical: 4, alignSelf: "flex-start", marginBottom: 12,
  },
  batchBadgeText: { color: "#C9A227", fontWeight: "700", fontSize: 13 },
  priceBlock: { marginBottom: 16 },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceLeft: { flexDirection: "row", alignItems: "baseline", gap: 10 },
  currentPrice: { fontSize: 22, fontWeight: "800", color: "#101828" },
  originalPrice: {
    fontSize: 15,
    color: "#98A2B3",
    textDecorationLine: "line-through",
  },
  discount: { fontSize: 13, fontWeight: "700", color: "#12B76A" },
  divider: { height: 1, backgroundColor: "#E4E7EC", marginVertical: 12 },
  dates: { fontSize: 13, fontWeight: "600", color: "#C9A227" },
  freeBadge: { fontSize: 18, fontWeight: "800", color: "#12B76A", marginBottom: 6 },
  sectionHeading: { fontSize: 16, fontWeight: "800", color: "#101828", marginBottom: 10 },
  description: { fontSize: 14, lineHeight: 22, color: "#344054", marginBottom: 8 },
  readMore: { fontSize: 14, fontWeight: "700", color: "#1570EF", marginBottom: 12 },
  bullet: { fontSize: 14, lineHeight: 24, color: "#344054", marginBottom: 4 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 16 },
  meta: { fontSize: 13, color: "#667085" },
  secondaryBtn: {
    marginTop: 16,
    backgroundColor: "#F2F4F7",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E4E7EC",
  },
  secondaryBtnText: { fontWeight: "700", color: "#1B2B4B" },
  lockedNote: { marginTop: 12, fontSize: 13, color: "#667085" },
  error: { color: "#F04438", paddingHorizontal: 16, marginTop: 8 },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E4E7EC",
  },
  buyBtn: {
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  buyBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
