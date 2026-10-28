import { useEffect, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { OtpVerificationModal } from "@/components/auth/OtpVerificationModal";
import { useTheme } from "@/theme/ThemeProvider";
import { authApi } from "@/services/auth";
import {
  getApiBaseUrl,
  getDefaultApiBaseUrl,
  restoreApiBaseUrlOverride,
  setApiBaseUrlOverride,
} from "@/services/apiClient";
import { useAuthStore } from "@/store/authStore";
import type { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;
type LoginMode = "email" | "otp";

const extractTextFromHtml = (html: string): string | null => {
  const noTags = html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ");
  const cleaned = noTags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return null;
  if (cleaned.length > 320) return cleaned.slice(0, 317) + "...";
  return cleaned;
};

export default function LoginScreen({ navigation }: Props) {
  const { colors, radius } = useTheme();
  const [mode, setMode] = useState<LoginMode>("otp"); // default to OTP flow as requested
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  const logoTapCount = useRef(0);
  const logoTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showUrlPanel, setShowUrlPanel] = useState(false);
  const [overrideInput, setOverrideInput] = useState("");
  const [currentUrl, setCurrentUrl] = useState(getApiBaseUrl());
  const [urlSaved, setUrlSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const restored = await restoreApiBaseUrlOverride();
      setCurrentUrl(restored || getDefaultApiBaseUrl());
      setOverrideInput(restored || "");
    })();
  }, []);

  const handleLogoTap = () => {
    logoTapCount.current += 1;
    if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
    logoTapTimer.current = setTimeout(() => {
      logoTapCount.current = 0;
    }, 1500);
    if (logoTapCount.current >= 7) {
      logoTapCount.current = 0;
      setShowUrlPanel((v) => !v);
      setOverrideInput(getApiBaseUrl());
    }
  };

  const handleSaveOverride = async () => {
    const raw = overrideInput.trim();
    if (!raw) {
      await setApiBaseUrlOverride(null);
      setCurrentUrl(getDefaultApiBaseUrl());
      setUrlSaved(true);
      setTimeout(() => setUrlSaved(false), 2000);
      return;
    }
    let normalized = raw.replace(/\/$/, "");
    if (!/\/api\/v\d+$/.test(normalized)) normalized = `${normalized}/api/v1`;
    await setApiBaseUrlOverride(normalized);
    setCurrentUrl(normalized);
    setOverrideInput(normalized);
    setUrlSaved(true);
    setTimeout(() => setUrlSaved(false), 2000);
  };

  const getErrorMessage = (err: unknown, fallback: string): string => {
    type AxErr = {
      response?: {
        status?: number;
        statusText?: string;
        data?: unknown;
        headers?: Record<string, unknown>;
      };
      request?: unknown;
      message?: string;
    };
    const axiosErr = err as AxErr;
    const data = axiosErr.response?.data;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const d = data as {
        detail?: unknown;
        email?: unknown;
        password?: unknown;
      };
      if (typeof d.detail === "string") return d.detail;
      if (Array.isArray(d.email) && typeof d.email[0] === "string")
        return `Email: ${d.email[0]}`;
      if (Array.isArray(d.password) && typeof d.password[0] === "string")
        return `Password: ${d.password[0]}`;
    }
    if (typeof data === "string") {
      if (/<html|<body|<title/i.test(data)) {
        const plain = extractTextFromHtml(data);
        if (/Cloudflare is currently unable to reach/i.test(plain || data)) {
          return "⛔ SERVER TUNNEL DOWN: Cloudflare aapke PC tak connect nahi kar pa raha. Aapke PC ko ON + Internet pe connected hona chahiye, aur tunnel aur Django server dono chal rahe hone chahiye. Agar aap remote ho to admin se naya public URL maango aur logo ko 7 baar tap karke URL update kro.";
        }
        if (plain) return `⚠️ Server error: ${plain}`;
      }
      if (data.length < 300) return data;
    }
    const status = axiosErr.response?.status;
    if (status === 401) return fallback;
    if (status === 400) return fallback;
    if (status === 404) return "Server endpoint not found (404).";
    if (status === 500) return "Server error (500). Contact admin.";
    if (status && status >= 500)
      return `Server error (${status}). ${axiosErr.response?.statusText || ""}`.trim();
    if (!axiosErr.response && axiosErr.request)
      return "⚠️ NETWORK ERROR: Server nahi mil raha. Check kare — 1) Internet/Mobile data on hai? 2) Public URL valid hai? 3) Tunnel + backend server chalu hai? Logo ko 7 baar tap karke Server URL override kar sakte ho.";
    return (axiosErr as Error).message || fallback;
  };

  const handleEmailLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const { user, access, refresh } = await authApi.login(email, password);
      await setTokens(access, refresh);
      setUser(user);
    } catch (err) {
      setError(getErrorMessage(err, "Invalid email or password."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    const rawDigits = phone.replace(/\D/g, "");
    if (!rawDigits || (rawDigits.length !== 10 && !(rawDigits.length > 10 && rawDigits.endsWith(rawDigits.slice(-10))))) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError(null);
    setModalError(null);
    setIsSubmitting(true);
    try {
      const res = await authApi.requestOtp({ phone });
      const returnedOtp = res.dev_otp || res.otp || null;
      setDevOtp(returnedOtp);
      setShowOtpModal(true);
    } catch (err) {
      setError(getErrorMessage(err, "Could not send OTP. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalVerify = async (enteredOtp: string) => {
    setModalError(null);
    setIsVerifying(true);
    try {
      const { user, access, refresh } = await authApi.verifyOtp(
        { phone },
        enteredOtp,
        "login",
      );
      await setTokens(access, refresh);
      setUser(user);
      setShowOtpModal(false);
    } catch (err) {
      setModalError(getErrorMessage(err, "Invalid or expired OTP."));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleModalResend = async () => {
    setModalError(null);
    setIsResending(true);
    try {
      const res = await authApi.requestOtp({ phone });
      const returnedOtp = res.dev_otp || res.otp || null;
      setDevOtp(returnedOtp);
    } catch (err) {
      setModalError(getErrorMessage(err, "Failed to resend OTP. Please try again."));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Pressable onPress={handleLogoTap}>
            <Image
              source={require("../../../assets/splash-logo.jpg")}
              style={styles.logo}
            />
          </Pressable>
          <AppText variant="h1" style={{ marginTop: 16, color: "#1B2B4B" }}>
            Concept Builder
          </AppText>
          <AppText
            style={{
              color: "#C9A227",
              fontWeight: "700",
              letterSpacing: 2,
              fontSize: 12,
            }}
          >
            CLASSES
          </AppText>
          <AppText variant="muted" style={{ marginTop: 8 }}>
            Sign in to continue learning
          </AppText>
        </View>

        {showUrlPanel && (
          <View
            style={[
              styles.urlPanel,
              {
                borderColor: colors.border,
                borderRadius: radius.md,
                backgroundColor: "#F7FAFC",
              },
            ]}
          >
            <AppText
              variant="caption"
              style={{ color: "#C9A227", fontWeight: "700", marginBottom: 4 }}
            >
              🛠 Developer Panel (hidden — tap logo 7x to toggle)
            </AppText>
            <AppText variant="caption" style={{ marginBottom: 4 }}>
              Current: {currentUrl}
            </AppText>
            <AppText variant="caption" style={{ marginBottom: 6 }}>
              Override Server URL (full base URL, e.g.
              https://cbclasses-backend.onrender.com/api/v1):
            </AppText>
            <TextInput
              value={overrideInput}
              onChangeText={setOverrideInput}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="https://something.trycloudflare.com"
              placeholderTextColor={colors.muted}
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  borderRadius: radius.md,
                  fontSize: 12,
                  paddingVertical: 10,
                  marginBottom: 10,
                },
              ]}
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Button
                  label={urlSaved ? "✓ Saved" : "Save URL"}
                  variant="primary"
                  onPress={handleSaveOverride}
                  disabled={urlSaved}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  label="Reset Default"
                  variant="secondary"
                  onPress={async () => {
                    await setApiBaseUrlOverride(null);
                    setOverrideInput("");
                    setCurrentUrl(getDefaultApiBaseUrl());
                  }}
                />
              </View>
            </View>
          </View>
        )}

        <View
          style={[
            styles.modeRow,
            { backgroundColor: "#EEF2F6", borderRadius: radius.pill },
          ]}
        >
          {(["otp", "email"] as LoginMode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => {
                setMode(m);
                setError(null);
              }}
              style={[
                styles.modeBtn,
                { borderRadius: radius.pill },
                mode === m && { backgroundColor: "#1B2B4B" },
              ]}
            >
              <AppText
                style={{
                  fontWeight: "700",
                  fontSize: 13,
                  color: mode === m ? "#fff" : colors.muted,
                }}
              >
                {m === "otp" ? "Mobile OTP" : "Email Login"}
              </AppText>
            </Pressable>
          ))}
        </View>

        {mode === "email" ? (
          <>
            <AppText
              variant="caption"
              style={{ marginTop: 20, marginBottom: 6 }}
            >
              Email
            </AppText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  borderRadius: radius.md,
                },
              ]}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.muted}
            />
            <AppText
              variant="caption"
              style={{ marginTop: 16, marginBottom: 6 }}
            >
              Password
            </AppText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  borderRadius: radius.md,
                },
              ]}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
            />
            <View style={{ alignItems: "flex-end", marginTop: 8 }}>
              <AppText
                variant="caption"
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                Forgot password?
              </AppText>
            </View>
            <View style={{ marginTop: 20 }}>
              <Button
                label="Sign In"
                fullWidth
                loading={isSubmitting}
                onPress={handleEmailLogin}
              />
            </View>
          </>
        ) : (
          <>
            <AppText
              variant="caption"
              style={{ marginTop: 20, marginBottom: 6 }}
            >
              Mobile Number
            </AppText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  borderRadius: radius.md,
                },
              ]}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 98765 43210"
              placeholderTextColor={colors.muted}
              maxLength={15}
            />
            <AppText variant="caption" style={{ marginTop: 6, color: colors.muted }}>
              Enter your 10-digit mobile number to receive a secure OTP.
            </AppText>
            <View style={{ marginTop: 20 }}>
              <Button
                label="Get OTP"
                fullWidth
                loading={isSubmitting}
                onPress={handleSendOtp}
              />
            </View>
          </>
        )}

        {/* OTP Verification Modal popup */}
        <OtpVerificationModal
          visible={showOtpModal}
          phone={phone}
          devOtp={devOtp}
          isVerifying={isVerifying}
          isResending={isResending}
          error={modalError}
          onVerify={handleModalVerify}
          onResend={handleModalResend}
          onClose={() => {
            setShowOtpModal(false);
            setModalError(null);
          }}
        />

        {error && (
          <AppText style={{ color: "#F04438", marginTop: 12 }}>{error}</AppText>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 24,
            gap: 4,
          }}
        >
          <AppText variant="muted">New student?</AppText>
          <AppText
            style={{ fontWeight: "700", color: "#1B2B4B" }}
            onPress={() => navigation.navigate("Register")}
          >
            Create account
          </AppText>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { width: 110, height: 110, borderRadius: 55 },
  modeRow: { flexDirection: "row", padding: 4 },
  modeBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  otpInput: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 22,
    letterSpacing: 8,
    textAlign: "center",
  },
  urlPanel: { borderWidth: 1, padding: 12, marginBottom: 16 },
});
