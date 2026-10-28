import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { AppText } from "@/components/AppText";
import { useTheme } from "@/theme/ThemeProvider";

interface Props {
  visible: boolean;
  phone: string;
  devOtp: string | null;
  isVerifying: boolean;
  isResending: boolean;
  error: string | null;
  onVerify: (otp: string) => void;
  onResend: () => void;
  onClose: () => void;
}

export function OtpVerificationModal({
  visible,
  phone,
  devOtp,
  isVerifying,
  isResending,
  error,
  onVerify,
  onResend,
  onClose,
}: Props) {
  const { colors, brand, radius } = useTheme();
  const [otpDigits, setOtpDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [expirySeconds, setExpirySeconds] = useState(300); // 5 minutes
  const [resendCooldown, setResendCooldown] = useState(30);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Reset timers when modal opens
  useEffect(() => {
    if (visible) {
      setOtpDigits(["", "", "", "", "", ""]);
      setExpirySeconds(300);
      setResendCooldown(30);
      // Focus first box after animation
      setTimeout(() => inputRefs.current[0]?.focus(), 350);
    }
  }, [visible, devOtp]);

  // Expiry countdown (5 min)
  useEffect(() => {
    if (!visible) return;
    if (expirySeconds <= 0) return;
    const t = setInterval(
      () => setExpirySeconds((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => clearInterval(t);
  }, [visible, expirySeconds]);

  // Resend cooldown (30s)
  useEffect(() => {
    if (!visible) return;
    if (resendCooldown <= 0) return;
    const t = setInterval(
      () => setResendCooldown((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => clearInterval(t);
  }, [visible, resendCooldown]);

  const handleResend = () => {
    setExpirySeconds(300);
    setResendCooldown(30);
    setOtpDigits(["", "", "", "", "", ""]);
    onResend();
  };

  const formatTime = (secs: number) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleChange = (text: string, index: number) => {
    // Handle paste of full OTP
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 6).split("");
      const next = ["", "", "", "", "", ""];
      chars.forEach((c, i) => {
        if (i < 6) next[i] = c;
      });
      setOtpDigits(next);
      const lastIdx = Math.min(chars.length, 6) - 1;
      if (lastIdx >= 0 && lastIdx < 6) {
        inputRefs.current[Math.min(lastIdx + 1, 5)]?.focus();
      }
      return;
    }
    const digit = cleaned.slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const fullOtp = otpDigits.join("");
  const isExpired = expirySeconds <= 0;
  const canVerify = fullOtp.length === 6 && !isExpired && !isVerifying;
  const canResend = resendCooldown <= 0 && !isResending;

  const maskedPhone =
    phone.length >= 10
      ? `+91 ${phone.slice(0, 2)}****${phone.slice(-4)}`
      : phone;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: brand.primary + "18" },
              ]}
            >
              <AppText style={{ fontSize: 22 }}>🔐</AppText>
            </View>
            <AppText style={[styles.title, { color: colors.text }]}>
              Verify OTP
            </AppText>
            <AppText style={[styles.subtitle, { color: colors.muted }]}>
              OTP sent to {maskedPhone}
            </AppText>
          </View>

          {/* Dev OTP Banner */}
          {devOtp ? (
            <View
              style={[
                styles.devBanner,
                {
                  backgroundColor: "#FFFBEB",
                  borderColor: "#F59E0B",
                  borderRadius: radius.md,
                },
              ]}
            >
              <AppText style={styles.devLabel}>
                🧪 Testing OTP (development mode)
              </AppText>
              <View style={styles.devOtpRow}>
                {devOtp.split("").map((d, i) => (
                  <View
                    key={i}
                    style={[
                      styles.devDigitBox,
                      { backgroundColor: "#fff", borderColor: "#F59E0B" },
                    ]}
                  >
                    <AppText style={styles.devDigit}>{d}</AppText>
                  </View>
                ))}
              </View>
              <AppText style={styles.devHint}>
                Copy this OTP and enter below to verify
              </AppText>
            </View>
          ) : null}

          {/* 6 OTP Boxes */}
          <View style={styles.otpRow}>
            {otpDigits.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                value={digit}
                onChangeText={(t) => handleChange(t, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                keyboardType="number-pad"
                maxLength={6}
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                selectTextOnFocus
                editable={!isVerifying && !isExpired}
                style={[
                  styles.otpBox,
                  {
                    borderColor: digit ? brand.primary : colors.border,
                    color: colors.text,
                    backgroundColor: colors.background,
                    borderRadius: radius.md,
                  },
                  isExpired && { borderColor: "#F04438", opacity: 0.6 },
                ]}
              />
            ))}
          </View>

          {/* Expiry countdown */}
          <View style={styles.timerRow}>
            {isExpired ? (
              <AppText
                style={{ color: "#F04438", fontSize: 12, fontWeight: "700" }}
              >
                ⏰ OTP has expired. Please request a new OTP.
              </AppText>
            ) : (
              <AppText style={{ color: colors.muted, fontSize: 12 }}>
                OTP expires in{" "}
                <AppText
                  style={{
                    color: isExpired ? "#F04438" : brand.primary,
                    fontWeight: "800",
                  }}
                >
                  {formatTime(expirySeconds)}
                </AppText>
              </AppText>
            )}
          </View>

          {/* Error */}
          {error ? (
            <View
              style={[
                styles.errorBox,
                {
                  backgroundColor: "#FEF2F2",
                  borderColor: "#FECACA",
                  borderRadius: radius.md,
                },
              ]}
            >
              <AppText
                style={{ color: "#DC2626", fontSize: 12, textAlign: "center" }}
              >
                {error}
              </AppText>
            </View>
          ) : null}

          {/* Verify Button */}
          <Pressable
            onPress={() => canVerify && onVerify(fullOtp)}
            disabled={!canVerify}
            style={[
              styles.verifyBtn,
              {
                backgroundColor: canVerify ? brand.primary : colors.border,
                borderRadius: radius.md,
                opacity: canVerify ? 1 : 0.7,
              },
            ]}
          >
            {isVerifying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <AppText
                style={{
                  color: canVerify ? "#fff" : colors.muted,
                  fontWeight: "800",
                  fontSize: 15,
                }}
              >
                Verify & Login
              </AppText>
            )}
          </Pressable>

          {/* Resend */}
          <View style={styles.resendRow}>
            <AppText style={{ color: colors.muted, fontSize: 12 }}>
              Didn&apos;t receive OTP?{" "}
            </AppText>
            {canResend ? (
              <Pressable onPress={handleResend} disabled={isResending}>
                <AppText
                  style={{
                    color: brand.primary,
                    fontWeight: "700",
                    fontSize: 12,
                  }}
                >
                  {isResending ? "Sending..." : "Resend OTP"}
                </AppText>
              </Pressable>
            ) : (
              <AppText style={{ color: colors.muted, fontSize: 12 }}>
                Resend OTP in {resendCooldown}s
              </AppText>
            )}
          </View>

          {/* Close */}
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <AppText style={{ color: colors.muted, fontSize: 13 }}>
              Cancel
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(11, 19, 43, 0.62)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  header: { alignItems: "center", marginBottom: 16 },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 12, textAlign: "center" },
  devBanner: {
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  devLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 8,
  },
  devOtpRow: { flexDirection: "row", gap: 6, marginBottom: 6 },
  devDigitBox: {
    width: 30,
    height: 34,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  devDigit: { fontSize: 16, fontWeight: "800", color: "#1B2B4B" },
  devHint: { fontSize: 10, color: "#92400E", marginTop: 2 },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 10,
  },
  otpBox: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
  },
  timerRow: { alignItems: "center", marginBottom: 10 },
  errorBox: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  verifyBtn: {
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  closeBtn: { alignItems: "center", paddingVertical: 6 },
});
