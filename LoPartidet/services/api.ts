import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") return localStorage.getItem("auth_token");
  return SecureStore.getItemAsync("auth_token");
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 401) {
    onUnauthorized?.();
  }

  return response;
}
