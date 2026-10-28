import { apiClient } from "./apiClient";
import type { StudentUser } from "@/store/authStore";

export const authApi = {
  register: (email: string, username: string, password: string, phone?: string) =>
    apiClient.post("/auth/register/", { email, username, password, phone }).then((r) => r.data),
  login: (email: string, password: string) =>
    apiClient.post<{ user: StudentUser; access: string; refresh: string }>("/auth/login/", { email, password })
      .then((r) => r.data),
  requestOtp: (payload: { phone?: string; email?: string; purpose?: string }) =>
    apiClient
      .post<{
        message: string;
        phone?: string;
        email?: string;
        dev_otp?: string;
        otp?: string;
        expires_in_seconds?: number;
        resend_cooldown_seconds?: number;
      }>("/auth/request-otp/", payload)
      .then((r) => r.data),
  verifyOtp: (
    identifier: { phone?: string; email?: string } | string,
    otp: string,
    purpose: "register" | "login" | "reset_password" = "login",
  ) => {
    const payload =
      typeof identifier === "string"
        ? identifier.includes("@")
          ? { email: identifier, otp, purpose }
          : { phone: identifier, otp, purpose }
        : { ...identifier, otp, purpose };
    return apiClient
      .post<{ user: StudentUser; access: string; refresh: string }>(
        "/auth/verify-otp/",
        payload,
      )
      .then((r) => r.data);
  },
  forgotPassword: (email: string) => apiClient.post("/auth/forgot-password/", { email }).then((r) => r.data),
  resetPassword: (email: string, otp: string, new_password: string) =>
    apiClient.post("/auth/reset-password/", { email, otp, new_password }).then((r) => r.data),
  me: () => apiClient.get<StudentUser>("/auth/me/").then((r) => r.data),
  updateMe: (patch: Partial<StudentUser>) => apiClient.patch<StudentUser>("/auth/me/", patch).then((r) => r.data),
};
