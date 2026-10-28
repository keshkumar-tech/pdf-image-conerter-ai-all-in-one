import { Pressable, Share, StyleSheet, View } from "react-native";
import { AppText } from "@/components/AppText";
import { CourseThumbnail } from "@/components/courses/CourseThumbnail";
import { useTheme } from "@/theme/ThemeProvider";
import type { Course } from "@/services/types";
import { formatRupee, getCoursePriceInfo } from "@/utils/coursePricing";

interface CourseListCardProps {
  course: Course;
  onPress?: () => void;
  variant?: "catalog" | "tab";
}

function getExpiryLabel() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function CourseListCard({ course, onPress, variant = "catalog" }: CourseListCardProps) {
  const { colors, radius } = useTheme();
  const pricing = getCoursePriceInfo(course);
  const courseType = course.is_free ? "free" : "paid";
  const expiry = getExpiryLabel();
  const displayPrice = pricing.isFree ? 0 : (pricing.current ?? 0);

  const shareCourse = () => {
    Share.share({ message: `Check out "${course.title}" on Concept Builder Classes!` }).catch(() => undefined);
  };

  if (variant === "tab") {
    return (
      <Pressable
        onPress={onPress}
        style={[styles.tabCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}
      >
        <CourseThumbnail
          size="banner"
          type={courseType}
          uri={course.thumbnail_url}
          bannerUri={course.banner_url}
        />
        <View style={styles.tabBody}>
          <View style={styles.topRow}>
            <AppText style={[styles.batchName, { color: colors.text }]} numberOfLines={2}>{course.title}</AppText>
            <ShareButton onPress={shareCourse} borderColor={colors.border} />
          </View>
          <AppText style={[styles.expiry, { color: colors.muted }]}>Expiry Date: {expiry}</AppText>
          <AppText style={[styles.tabPrice, { color: colors.text }]}>{formatRupee(displayPrice)}</AppText>
          <Pressable onPress={onPress} style={styles.viewBtn}>
            <AppText style={styles.viewBtnText}>View Course</AppText>
          </Pressable>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={[styles.catalogCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}
    >
      <CourseThumbnail
        size="card"
        type={courseType}
        uri={course.thumbnail_url}
        bannerUri={course.banner_url}
      />
      <View style={styles.catalogContent}>
        <View style={styles.topRow}>
          <AppText style={[styles.batchName, { color: colors.text }]} numberOfLines={2}>{course.title}</AppText>
          <View style={styles.rightCol}>
            <ShareButton onPress={shareCourse} borderColor={colors.border} />
            {!pricing.isFree && pricing.discountPercent != null && (
              <AppText style={styles.discountRight}>{pricing.discountPercent.toFixed(2)}% off</AppText>
            )}
          </View>
        </View>
        <AppText style={[styles.expirySmall, { color: colors.muted }]}>Expiry Date: {expiry}</AppText>
        <AppText style={[styles.catalogPrice, { color: colors.text }]}>{formatRupee(displayPrice)}</AppText>
        {!pricing.isFree && pricing.original != null && (
          <AppText style={[styles.originalPrice, { color: colors.muted }]}>{formatRupee(pricing.original)}</AppText>
        )}
      </View>
    </Pressable>
  );
}

function ShareButton({ onPress, borderColor }: { onPress: () => void; borderColor: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={[styles.shareBtn, { borderColor }]}>
      <AppText style={styles.shareIcon}>⤴</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabCard: {
    borderWidth: 1,
    marginHorizontal: 12,
    marginVertical: 8,
    overflow: "hidden",
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tabBody: { padding: 14 },
  tabPrice: { marginTop: 8, fontWeight: "800", fontSize: 20 },
  catalogCard: {
    flexDirection: "row",
    borderWidth: 1,
    marginHorizontal: 8,
    marginVertical: 8,
    padding: 12,
    gap: 12,
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  catalogContent: { flex: 1, justifyContent: "center" },
  topRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  batchName: { flex: 1, fontWeight: "700", fontSize: 15, lineHeight: 21 },
  rightCol: { alignItems: "center", minWidth: 56 },
  shareBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  shareIcon: { fontSize: 14, color: "#667085" },
  discountRight: { fontSize: 11, fontWeight: "700", color: "#12B76A", marginTop: 6, textAlign: "center" },
  expiry: { marginTop: 6, fontSize: 12 },
  expirySmall: { marginTop: 4, fontSize: 11 },
  catalogPrice: { marginTop: 6, fontWeight: "800", fontSize: 17 },
  originalPrice: { fontSize: 12, textDecorationLine: "line-through", marginTop: 2 },
  viewBtn: { marginTop: 14, backgroundColor: "#1B2B4B", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  viewBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
