import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: { key: string; label: string; permissions: string[] } | null;
  avatar_url?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: AdminUser) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),
      hasPermission: (permission) => {
        const role = get().user?.role;
        if (!role) return false;
        if (role.key === "super_admin") return true;
        return role.permissions.includes(permission) || role.permissions.includes("*");
      },
    }),
    { name: "cwk-admin-auth" }
  )
);
