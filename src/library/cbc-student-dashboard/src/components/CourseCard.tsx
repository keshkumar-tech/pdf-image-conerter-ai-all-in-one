import { Image, Pressable, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { Badge } from "./Badge";
import { ProgressBar } from "./ProgressBar";
import { useTheme } from "@/theme/ThemeProvider";
import type { Course } from "@/services/types";

export function CourseCard({ course, progressPercent, onPress }: { course: Course; progressPercent?: number; onPress?: () => void }) {
  const { colors, radius } = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
      {course.thumbnail_url ? (
        <Image source={{ uri: course.thumbnail_url }} style={[styles.thumb, { borderRadius: radius.md }]} />
      ) : (
        <View style={[styles.thumb, styles.thumbFallback, { borderRadius: radius.md, backgroundColor: colors.border }]} />
      )}
      <View style={{ flex: 1 }}>
        <AppText variant="h3" numberOfLines={1}>{course.title}</AppText>
        <AppText variant="muted" numberOfLines={1}>{course.instructor_name} · {course.level}</AppText>
        <View style={styles.row}>
          {course.is_free ? <Badge tone="success">Free</Badge> : <Badge tone="primary">{`₹${course.pricing_plan?.price ?? "—"}`}</Badge>}
          <AppText variant="caption">★ {course.rating_average} · {course.students_count} students</AppText>
        </View>
        {typeof progressPercent === "number" && (
          <View style={{ marginTop: 8 }}>
            <ProgressBar percent={progressPercent} />
            <AppText variant="caption" style={{ marginTop: 4 }}>{progressPercent}% complete</AppText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", gap: 12, borderWidth: 1, padding: 10, marginBottom: 12 },
  thumb: { width: 84, height: 84 },
  thumbFallback: { alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 },
});
