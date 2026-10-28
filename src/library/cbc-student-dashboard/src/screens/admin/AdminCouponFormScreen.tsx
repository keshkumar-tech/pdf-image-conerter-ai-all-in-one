import { useCallback, useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { apiClient } from "@/services/apiClient";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminCouponForm">;

export default function AdminCouponFormScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const isEdit = id !== null;
  const { colors, brand, radius } = useTheme();
  const [form, setForm] = useState({
    code: "", discount_type: "percent", discount_value: "",
    valid_from: new Date().toISOString().split("T")[0],
    valid_until: "", max_uses: "", is_active: true,
  });
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res = await apiClient.get(`/coupons/${id}/`);
      const d = res.data;
      setForm({ code: d.code, discount_type: d.discount_type, discount_value: String(d.discount_value), valid_from: d.valid_from?.split("T")[0] ?? "", valid_until: d.valid_until?.split("T")[0] ?? "", max_uses: d.max_uses ? String(d.max_uses) : "", is_active: d.is_active });
    } catch { Alert.alert("Error", "Could not load."); navigation.goBack(); }
    finally { setIsLoading(false); }
  }, [id]);

  useEffect(() => { load(); navigation.setOptions({ title: isEdit ? "Edit Coupon" : "Create Coupon" }); }, []);

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.code.trim() || !form.discount_value.trim()) { Alert.alert("Validation", "Code and discount value are required."); return; }
    setIsSaving(true);
    try {
      const payload: any = {
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        valid_from: form.valid_from || new Date().toISOString().split("T")[0],
        valid_until: form.valid_until || null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        is_active: form.is_active,
      };
      if (isEdit) await apiClient.patch(`/coupons/${id}/`, payload);
      else await apiClient.post("/coupons/", payload);
      Alert.alert("Success", isEdit ? "Updated!" : "Coupon created!", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data ? JSON.stringify(e.response.data).slice(0, 200) : "Save failed.");
    } finally { setIsSaving(false); }
  };

  if (isLoading) return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><LoadingState label="Loading..." /></SafeAreaView>;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <AppText style={[styles.label, { color: colors.muted }]}>Coupon Code *</AppText>
          <TextInput value={form.code} onChangeText={(v) => set("code", v.toUpperCase())}
            placeholder="e.g. SAVE50" autoCapitalize="characters" placeholderTextColor={colors.muted}
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface, fontSize: 18, letterSpacing: 2, fontWeight: "800" }]} />

          <AppText style={[styles.label, { color: colors.muted }]}>Discount Type</AppText>
          <View style={styles.chipRow}>
            {[["percent", "% Percentage"], ["flat", "₹ Flat Amount"]].map(([val, lbl]) => (
              <Pressable key={val} onPress={() => set("discount_type", val)}
                style={[styles.chip, { borderColor: colors.border, borderRadius: radius.md }, form.discount_type === val && { backgroundColor: brand.primary, borderColor: brand.primary }]}>
                <AppText style={{ color: form.discount_type === val ? "#fff" : colors.muted, fontSize: 13, fontWeight: "700" }}>{lbl}</AppText>
              </Pressable>
            ))}
          </View>

          <AppText style={[styles.label, { color: colors.muted }]}>
            Discount Value * {form.discount_type === "percent" ? "(e.g. 20 for 20%)" : "(e.g. 200 for ₹200)"}
          </AppText>
          <TextInput value={form.discount_value} onChangeText={(v) => set("discount_value", v)}
            placeholder={form.discount_type === "percent" ? "20" : "200"} keyboardType="numeric" placeholderTextColor={colors.muted}
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]} />

          {[["Valid From (YYYY-MM-DD)", "valid_from", "2026-01-01"], ["Valid Until (YYYY-MM-DD)", "valid_until", "2026-12-31 (leave blank = no expiry)"], ["Max Uses", "max_uses", "100 (leave blank = unlimited)"]].map(([lbl, key, ph]) => (
            <View key={key}>
              <AppText style={[styles.label, { color: colors.muted }]}>{lbl}</AppText>
              <TextInput value={(form as any)[key]} onChangeText={(v) => set(key, v)} placeholder={ph}
                placeholderTextColor={colors.muted} keyboardType={key === "max_uses" ? "numeric" : "default"}
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]} />
            </View>
          ))}

          <View style={[styles.toggleCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            <View style={styles.toggleRow}>
              <AppText style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>✅ Active (usable by students)</AppText>
              <Switch value={form.is_active} onValueChange={(v) => set("is_active", v)} trackColor={{ true: brand.primary, false: colors.border }} thumbColor="#fff" />
            </View>
          </View>

          <Pressable onPress={save} disabled={isSaving}
            style={[styles.saveBtn, { backgroundColor: brand.primary, borderRadius: radius.lg, opacity: isSaving ? 0.7 : 1 }]}>
            <AppText style={styles.saveBtnText}>{isSaving ? "Saving..." : isEdit ? "💾 Update Coupon" : "✅ Create Coupon"}</AppText>
          </Pressable>
          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 }, scroll: { padding: 16 },
  label: { fontSize: 11, fontWeight: "700", marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14 },
  chipRow: { flexDirection: "row", gap: 10 }, chip: { flex: 1, paddingVertical: 10, alignItems: "center", borderWidth: 1 },
  toggleCard: { borderWidth: 1, marginTop: 16 },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
  saveBtn: { marginTop: 24, paddingVertical: 15, alignItems: "center" }, saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
