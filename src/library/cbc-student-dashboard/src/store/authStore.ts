import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "@/services/secureStorage";
import { create } from "zustand";

export interface StudentUser {
  id: string;
  email: string;
  username: string;
  phone: string;
  avatar_url: string;
  is_email_verified: boolean;
  theme_preference: string;
  role: { key: string; label: string; permissions: string[] } | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: StudentUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isAdmin: boolean;
  hydrate: () => Promise<void>;
  setTokens: (access: string, refresh: string) => Promise<void>;
  setUser: (user: StudentUser) => void;
  logout: () => Promise<void>;
}

const ADMIN_ROLES = ["super_admin", "admin", "content_manager", "finance", "support"];

function checkIsAdmin(user: StudentUser | null): boolean {
  if (!user?.role) return false;
  return ADMIN_ROLES.includes(user.role.key) || (user.role.permissions ?? []).includes("*");
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  isAdmin: false,

  hydrate: async () => {
    const [access, refresh, userJson] = await Promise.all([
      SecureStore.getItemAsync("cwk_access_token"),
      SecureStore.getItemAsync("cwk_refresh_token"),
      AsyncStorage.getItem("cwk_user"),
    ]);
    const user = userJson ? JSON.parse(userJson) : null;
    set({
      accessToken: access,
      refreshToken: refresh,
      user,
      isAuthenticated: Boolean(access),
      isAdmin: checkIsAdmin(user),
      isHydrated: true,
    });
  },

  setTokens: async (access, refresh) => {
    await SecureStore.setItemAsync("cwk_access_token", access);
    await SecureStore.setItemAsync("cwk_refresh_token", refresh);
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
  },

  setUser: (user) => {
    AsyncStorage.setItem("cwk_user", JSON.stringify(user));
    set({ user, isAdmin: checkIsAdmin(user) });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("cwk_access_token");
    await SecureStore.deleteItemAsync("cwk_refresh_token");
    await AsyncStorage.removeItem("cwk_user");
    set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false, isAdmin: false });
  },
}));
