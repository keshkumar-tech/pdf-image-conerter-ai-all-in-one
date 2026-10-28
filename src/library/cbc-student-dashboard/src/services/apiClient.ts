import axios, { type AxiosInstance } from "axios";
import { useAuthStore } from "@/store/authStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ENV_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "https://cbclasses-backend.onrender.com/api/v1";

export const API_URL_STORAGE_KEY = "cb_api_url_override";

let _overrideUrl: string | null = null;

export const setApiBaseUrlOverride = async (url: string | null) => {
  _overrideUrl = url;
  if (url) {
    await AsyncStorage.setItem(API_URL_STORAGE_KEY, url);
  } else {
    await AsyncStorage.removeItem(API_URL_STORAGE_KEY);
  }
};

export const restoreApiBaseUrlOverride = async () => {
  const saved = await AsyncStorage.getItem(API_URL_STORAGE_KEY);
  if (saved) _overrideUrl = saved;
  return _overrideUrl;
};

export const getApiBaseUrl = () => _overrideUrl || ENV_API_BASE_URL;
export const getDefaultApiBaseUrl = () => ENV_API_BASE_URL;

export const apiClient: AxiosInstance = axios.create({
  baseURL: ENV_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "bypass-tunnel-reminder": "1",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  config.headers = config.headers ?? {};
  config.headers["bypass-tunnel-reminder"] = "1";
  config.headers.Accept = "application/json";
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const effectiveUrl = _overrideUrl || ENV_API_BASE_URL;
  if (config.baseURL !== effectiveUrl) config.baseURL = effectiveUrl;
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const { refreshToken, setTokens, logout } = useAuthStore.getState();
      if (!refreshToken) {
        await logout();
        return Promise.reject(error);
      }
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingQueue.push(() => resolve(apiClient(original)));
        });
      }
      isRefreshing = true;
      try {
        const base = _overrideUrl || ENV_API_BASE_URL;
        const { data } = await axios.post(`${base}/auth/refresh/`, {
          refresh: refreshToken,
        });
        await setTokens(data.access, refreshToken);
        pendingQueue.forEach((cb) => cb());
        pendingQueue = [];
        return apiClient(original);
      } catch (refreshError) {
        await logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);
