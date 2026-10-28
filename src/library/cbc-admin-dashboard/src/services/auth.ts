import { apiClient } from "./apiClient";
import type { AdminUser } from "@/store/authStore";

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{ user: AdminUser; access: string; refresh: string }>("/auth/login/", { email, password })
      .then((r) => r.data),
  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>("/auth/forgot-password/", { email }).then((r) => r.data),
  resetPassword: (email: string, otp: string, new_password: string) =>
    apiClient.post("/auth/reset-password/", { email, otp, new_password }).then((r) => r.data),
  me: () => apiClient.get<AdminUser>("/auth/me/").then((r) => r.data),
};
