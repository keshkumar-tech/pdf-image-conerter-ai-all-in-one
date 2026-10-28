import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { apiClient } from "@/services/apiClient";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminStudentDetail">;

interface StudentDetail {
  id: string;
  email: string;
  username: string;
  phone: string;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
  last_active_at: string | null;
  role: { key: string; label: string } | null;
  profile: {
    full_name: string | null;
    city: string | null;
    bio: string | null;
  } | null;
}

interface Enrollment {
  id: string;
  course: { id: string; title: string };
  enrolled_at: string;
  progress_percent: number;
}

export default function AdminStudentDetailScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  const { colors, brand, radius } = useTheme();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);
    try {
      const [userRes, enrollRes] = await Promise.all([
        apiClient.get<StudentDetail>(`/users/${userId}/`),
        apiClient.get(`/enrollments/?user=${userId}`),
      ]);
      setStudent(userRes.data);
      setEnrollments(enrollRes.data?.results ?? enrollRes.data ?? []);
      navigation.setOptions({ title: userRes.data.profile?.full_name ?? userRes.data.username });
    } catch {
      Alert.alert("Error", "Could not load student details.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggleActive = () => {
    if (!student) return;
    const action = student.is_active ? "Deactivate" : "Activate";
    Alert.alert(`${action} Account`, `${action} ${student.username}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: action,
        style: student.is_active ? "destructive" : "default",
        onPress: async () => {
          try {
            await apiClient.patch(`/users/${student.id}/`, { is_active: !student.is_active });
            setStudent((prev) => prev ? { ...prev, is_active: !prev.is_active } : prev);
          } catch {
            Alert.alert("Error", "Could not update student.");
          }
        },
      },
    ]);
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "Never";
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  if (isLoading) return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <LoadingState label="Loading student..." />
    </SafeAreaView>
  );

  if (!student) return null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={brand.primary} />}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: brand.primary, borderRadius: radius.lg }]}>
          <View style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <AppText style={styles.avatarText}>
              {(student.profile?.full_name ?? student.username ?? "?")[0].toUpperCase()}
            </AppText>
          </View>
          <AppText style={styles.profileName}>
            {student.profile?.full_name ?? student.username}
          </AppText>
          <AppText style={styles.profileEmail}>{student.email}</AppText>
          {!!student.phone && (
            <AppText style={styles.profilePhone}>📱 {student.phone}</AppText>
          )}
          <View style={[
            styles.statusBadge,
            { backgroundColor: student.is_active ? "rgba(18,183,106,0.3)" : "rgba(239,68,68,0.3)" },
          ]}>
            <AppText style={styles.statusText}>
              {student.is_active ? "✅ Active" : "🚫 Inactive"}
            </AppText>
          </View>
        </View>

        {/* Details */}
        <AppText style={[styles.sectionTitle, { color: colors.muted }]}>ACCOUNT DETAILS</AppText>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
          {[
            { label: "Username", value: student.username },
            { label: "Email Verified", value: student.is_email_verified ? "✅ Yes" : "❌ No" },
            { label: "City", value: student.profile?.city ?? "—" },
            { label: "Joined", value: formatDate(student.created_at) },
            { label: "Last Active", value: formatDate(student.last_active_at) },
          ].map((item, idx) => (
            <View
              key={item.label}
              style={[styles.detailRow, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
            >
              <AppText style={[styles.detailLabel, { color: colors.muted }]}>{item.label}</AppText>
              <AppText style={[styles.detailValue, { color: colors.text }]}>{item.value}</AppText>
            </View>
          ))}
        </View>

        {/* Enrollments */}
        <AppText style={[styles.sectionTitle, { color: colors.muted }]}>
          ENROLLMENTS ({enrollments.length})
        </AppText>
        {enrollments.length === 0 ? (
          <AppText style={[styles.noEnroll, { color: colors.muted }]}>No enrollments</AppText>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            {enrollments.map((enr, idx) => (
              <View
                key={enr.id}
                style={[styles.enrRow, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
              >
                <View style={{ flex: 1 }}>
                  <AppText style={[styles.enrTitle, { color: colors.text }]} numberOfLines={1}>
                    📚 {enr.course?.title ?? "—"}
                  </AppText>
                  <AppText style={[styles.enrDate, { color: colors.muted }]}>
                    {formatDate(enr.enrolled_at)}
                  </AppText>
                </View>
                <View style={[styles.progressBadge, { backgroundColor: brand.primary + "20" }]}>
                  <AppText style={[styles.progressText, { color: brand.primary }]}>
                    {Math.round(enr.progress_percent ?? 0)}%
                  </AppText>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <Pressable
          onPress={toggleActive}
          style={[
            styles.actionBtn,
            {
              backgroundColor: student.is_active ? "#EF444415" : "#12B76A15",
              borderColor: student.is_active ? "#EF4444" : "#12B76A",
              borderRadius: radius.lg,
            },
          ]}
        >
          <AppText style={[styles.actionText, { color: student.is_active ? "#EF4444" : "#12B76A" }]}>
            {student.is_active ? "🚫 Deactivate Account" : "✅ Activate Account"}
          </AppText>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16 },
  profileCard: { padding: 20, alignItems: "center", marginBottom: 20, gap: 6 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "800" },
  profileName: { color: "#fff", fontSize: 18, fontWeight: "800" },
  profileEmail: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  profilePhone: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginTop: 4 },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 6, marginLeft: 2 },
  card: { borderWidth: 1, marginBottom: 16, overflow: "hidden" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 11 },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: "600" },
  noEnroll: { fontSize: 13, marginBottom: 16, marginLeft: 2 },
  enrRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 11 },
  enrTitle: { fontSize: 13, fontWeight: "600" },
  enrDate: { fontSize: 11, marginTop: 2 },
  progressBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  progressText: { fontSize: 12, fontWeight: "700" },
  actionBtn: { paddingVertical: 14, alignItems: "center", borderWidth: 1 },
  actionText: { fontSize: 15, fontWeight: "800" },
});
