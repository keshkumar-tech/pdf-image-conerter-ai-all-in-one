import { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { coursesApi } from "@/services/resources";
import { paymentsApi } from "@/services/payments";
import type { Course } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";
import { formatRupee, getCoursePriceInfo } from "@/utils/coursePricing";

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;
type PayMode = "online" | "qr";
type PayMethod = "upi" | "cards" | "netbanking" | "wallet" | "paylater";

const PAYMENT_OPTIONS: { key: PayMethod; label: string; icon: string; brands?: string }[] = [
  { key: "upi", label: "UPI", icon: "◈", brands: "GPay · PhonePe · Paytm" },
  { key: "cards", label: "Cards", icon: "💳", brands: "Visa · Mastercard · RuPay" },
  { key: "netbanking", label: "Netbanking", icon: "🏛", brands: "HDFC · ICICI · SBI" },
  { key: "wallet", label: "Wallet", icon: "👛", brands: "PhonePe · Amazon Pay" },
  { key: "paylater", label: "Pay Later", icon: "🕐", brands: "Simpl · LazyPay" },
];

const UPI_APPS = [
  { id: "phonepe", label: "PhonePe", icon: "🟣" },
  { id: "gpay", label: "Google Pay", icon: "🔵" },
  { id: "paytm", label: "Paytm", icon: "🔷" },
  { id: "upiid", label: "Apps & UPI ID", icon: "⋯" },
];

export default function CheckoutScreen({ route, navigation }: Props) {
  const { courseId } = route.params;
  const insets = useSafeAreaInsets();
  const [course, setCourse] = useState<Course | null>(null);
  const [payMode, setPayMode] = useState<PayMode>("online");
  const [expanded, setExpanded] = useState<PayMethod | null>("upi");
  const [selectedUpi, setSelectedUpi] = useState("phonepe");
  const [selectedMethod, setSelectedMethod] = useState<PayMethod>("upi");
  const [showPaySheet, setShowPaySheet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Payment Options", headerTitleAlign: "center" });
  }, [navigation]);

  useEffect(() => {
    coursesApi.retrieve(courseId).then(setCourse).finally(() => setIsLoading(false));
  }, [courseId]);

  const pricing = course ? getCoursePriceInfo(course) : null;
  const amount = pricing?.current ?? 0;

  const completePayment = async () => {
    setIsProcessing(true);
    try {
      const { order } = await paymentsApi.createOrder(courseId);
      const result = await paymentsApi.verifyPayment(order.id, {
        provider_payment_id: `pay_demo_${Date.now()}`,
        razorpay_payment_id: `pay_demo_${Date.now()}`,
      });
      setShowPaySheet(false);
      navigation.replace("PaymentResult", {
        orderId: order.id,
        success: Boolean(result.entitlement),
        courseId,
      });
    } catch {
      setShowPaySheet(false);
      navigation.replace("PaymentResult", { orderId: "", success: false, courseId });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || !course || !pricing) {
    return <View style={styles.screen}><LoadingState label="Preparing payment..." /></View>;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.modeTabs}>
        {(["online", "qr"] as PayMode[]).map((mode) => (
          <Pressable
            key={mode}
            onPress={() => setPayMode(mode)}
            style={[styles.modeTab, payMode === mode && styles.modeTabActive]}
          >
            <AppText style={[styles.modeTabText, payMode === mode && styles.modeTabTextActive]}>
              {mode === "online" ? "Pay Online" : "QR Payment"}
            </AppText>
          </Pressable>
        ))}
      </View>

      {payMode === "online" ? (
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 120 + insets.bottom }]}>
          <AppText style={styles.sectionLabel}>All Payment Options</AppText>

          {PAYMENT_OPTIONS.map((opt) => (
            <View key={opt.key} style={styles.optionCard}>
              <Pressable
                onPress={() => {
                  setExpanded(expanded === opt.key ? null : opt.key);
                  setSelectedMethod(opt.key);
                }}
                style={styles.optionHeader}
              >
                <View style={styles.optionLeft}>
                  <AppText style={styles.optionIcon}>{opt.icon}</AppText>
                  <View>
                    <AppText style={styles.optionLabel}>{opt.label}</AppText>
                    {opt.brands && <AppText style={styles.optionBrands}>{opt.brands}</AppText>}
                  </View>
                </View>
                <AppText style={styles.chevron}>{expanded === opt.key ? "⌃" : opt.key === "cards" ? "›" : "⌄"}</AppText>
              </Pressable>

              {expanded === opt.key && opt.key === "upi" && (
                <View style={styles.subOptions}>
                  {UPI_APPS.map((app) => (
                    <Pressable
                      key={app.id}
                      onPress={() => { setSelectedUpi(app.id); setSelectedMethod("upi"); }}
                      style={[styles.subRow, selectedUpi === app.id && styles.subRowActive]}
                    >
                      <AppText style={styles.subIcon}>{app.icon}</AppText>
                      <AppText style={styles.subLabel}>{app.label}</AppText>
                      {selectedUpi === app.id && <AppText style={styles.check}>✓</AppText>}
                    </Pressable>
                  ))}
                </View>
              )}

              {expanded === opt.key && opt.key !== "upi" && (
                <View style={styles.subOptions}>
                  <AppText style={styles.demoNote}>
                    {opt.label} payment — demo mode. Tap Continue to complete.
                  </AppText>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={[styles.qrScroll, { paddingBottom: 120 + insets.bottom }]}>
          <View style={styles.qrCard}>
            <View style={styles.qrBox}>
              <View style={styles.qrPattern}>
                {Array.from({ length: 49 }).map((_, i) => (
                  <View key={i} style={[styles.qrCell, (i + i * 3) % 5 === 0 && styles.qrCellDark]} />
                ))}
              </View>
            </View>
            <AppText style={styles.qrTitle}>Scan & Pay with any UPI app</AppText>
            <AppText style={styles.qrAmount}>{formatRupee(amount)}</AppText>
            <AppText style={styles.qrHint}>Concept Builder Classes</AppText>
            <AppText style={styles.qrUpi}>UPI: conceptbuilder@upi</AppText>
          </View>
          <AppText style={styles.qrSteps}>
            1. Open PhonePe / GPay / Paytm{"\n"}
            2. Scan this QR code{"\n"}
            3. Tap "I've Paid" below after payment
          </AppText>
        </ScrollView>
      )}

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View>
          <AppText style={styles.footerPrice}>{formatRupee(amount)}</AppText>
          <Pressable onPress={() => setShowDetails((v) => !v)}>
            <AppText style={styles.viewDetails}>View Details {showDetails ? "⌃" : "⌄"}</AppText>
          </Pressable>
          {showDetails && (
            <AppText style={styles.detailLine}>{course.title}</AppText>
          )}
        </View>
        <Pressable
          onPress={() => (payMode === "online" ? setShowPaySheet(true) : completePayment())}
          style={styles.continueBtn}
        >
          <AppText style={styles.continueText}>
            {payMode === "qr" ? "I've Paid" : "Continue"}
          </AppText>
        </Pressable>
      </View>

      <Modal visible={showPaySheet} transparent animationType="slide">
        <Pressable style={styles.sheetBackdrop} onPress={() => setShowPaySheet(false)} />
        <View style={[styles.paySheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.sheetHeader}>
            <AppText style={styles.sheetTitle}>Pay {formatRupee(amount)}</AppText>
            <Pressable onPress={() => setShowPaySheet(false)} hitSlop={8}>
              <AppText style={styles.sheetClose}>✕</AppText>
            </Pressable>
          </View>

          <View style={styles.sheetRow}>
            <View style={styles.sheetMethod}>
              <AppText style={styles.sheetMethodIcon}>
                {selectedMethod === "upi" ? UPI_APPS.find((a) => a.id === selectedUpi)?.icon ?? "🟣" : "💳"}
              </AppText>
              <AppText style={styles.sheetMethodLabel}>
                {selectedMethod === "upi"
                  ? UPI_APPS.find((a) => a.id === selectedUpi)?.label ?? "PhonePe"
                  : PAYMENT_OPTIONS.find((o) => o.key === selectedMethod)?.label}
              </AppText>
            </View>
            <Pressable onPress={() => setShowPaySheet(false)}>
              <AppText style={styles.moreOptions}>More Options</AppText>
            </Pressable>
          </View>

          <Pressable
            onPress={completePayment}
            disabled={isProcessing}
            style={[styles.payBtn, isProcessing && { opacity: 0.7 }]}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <AppText style={styles.payBtnText}>Pay</AppText>
            )}
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F2F4F7" },
  modeTabs: { flexDirection: "row", gap: 10, padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E4E7EC" },
  modeTab: { flex: 1, paddingVertical: 10, borderRadius: 999, backgroundColor: "#F2F4F7", alignItems: "center" },
  modeTabActive: { backgroundColor: "#1B2B4B" },
  modeTabText: { fontWeight: "700", fontSize: 13, color: "#667085" },
  modeTabTextActive: { color: "#fff" },
  scroll: { padding: 16 },
  sectionLabel: { fontSize: 13, color: "#667085", marginBottom: 12, fontWeight: "600" },
  optionCard: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#E4E7EC", marginBottom: 10, overflow: "hidden" },
  optionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  optionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  optionIcon: { fontSize: 22, width: 28 },
  optionLabel: { fontWeight: "700", fontSize: 15, color: "#101828" },
  optionBrands: { fontSize: 11, color: "#98A2B3", marginTop: 2 },
  chevron: { fontSize: 18, color: "#98A2B3" },
  subOptions: { borderTopWidth: 1, borderTopColor: "#F2F4F7", paddingHorizontal: 12, paddingBottom: 8 },
  subRow: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10, marginTop: 6, gap: 10 },
  subRowActive: { backgroundColor: "#F0F4FF", borderWidth: 1, borderColor: "#C7D7FE" },
  subIcon: { fontSize: 20 },
  subLabel: { flex: 1, fontWeight: "600", fontSize: 14, color: "#101828" },
  check: { color: "#1B2B4B", fontWeight: "800" },
  demoNote: { padding: 12, fontSize: 13, color: "#667085" },
  qrScroll: { padding: 16, alignItems: "center" },
  qrCard: { backgroundColor: "#fff", borderRadius: 16, padding: 24, alignItems: "center", width: "100%", borderWidth: 1, borderColor: "#E4E7EC" },
  qrBox: { padding: 16, backgroundColor: "#fff", borderRadius: 12, borderWidth: 2, borderColor: "#101828" },
  qrPattern: { width: 180, height: 180, flexDirection: "row", flexWrap: "wrap" },
  qrCell: { width: 24, height: 24, backgroundColor: "#F2F4F7", margin: 1 },
  qrCellDark: { backgroundColor: "#101828" },
  qrTitle: { marginTop: 20, fontWeight: "700", fontSize: 16, color: "#101828" },
  qrAmount: { marginTop: 8, fontWeight: "800", fontSize: 24, color: "#1B2B4B" },
  qrHint: { marginTop: 4, fontSize: 13, color: "#667085" },
  qrUpi: { marginTop: 8, fontSize: 13, fontWeight: "600", color: "#1570EF" },
  qrSteps: { marginTop: 20, fontSize: 14, lineHeight: 24, color: "#344054", alignSelf: "flex-start" },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E4E7EC",
  },
  footerPrice: { fontWeight: "800", fontSize: 18, color: "#101828" },
  viewDetails: { fontSize: 12, color: "#1570EF", marginTop: 2 },
  detailLine: { fontSize: 11, color: "#667085", marginTop: 2, maxWidth: 180 },
  continueBtn: { backgroundColor: "#1B2B4B", paddingHorizontal: 32, paddingVertical: 14, borderRadius: 10 },
  continueText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  paySheet: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  sheetTitle: { fontWeight: "800", fontSize: 18, color: "#101828" },
  sheetClose: { fontSize: 20, color: "#667085" },
  sheetRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  sheetMethod: { flexDirection: "row", alignItems: "center", gap: 10 },
  sheetMethodIcon: { fontSize: 24 },
  sheetMethodLabel: { fontWeight: "700", fontSize: 15 },
  moreOptions: { color: "#1570EF", fontWeight: "600", fontSize: 13 },
  payBtn: { backgroundColor: "#1B2B4B", borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  payBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
