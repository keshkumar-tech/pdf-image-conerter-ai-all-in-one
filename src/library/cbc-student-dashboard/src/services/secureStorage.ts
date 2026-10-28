/**
 * Web-safe drop-in replacement for `expo-secure-store`.
 *
 * `expo-secure-store` has no web implementation, so on the web build its
 * promise never settles — which left the app stuck on the splash screen.
 * This module keeps the SAME API (`getItemAsync` / `setItemAsync` /
 * `deleteItemAsync`) and uses the OS keychain on native, but falls back to
 * `localStorage` on web. No app logic changes — only the storage backend.
 */
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const isWeb = Platform.OS === "web";

export async function getItemAsync(key: string): Promise<string | null> {
  if (isWeb) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (isWeb) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* ignore quota / privacy-mode errors */
    }
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    /* ignore */
  }
}

export async function deleteItemAsync(key: string): Promise<void> {
  if (isWeb) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    /* ignore */
  }
}
