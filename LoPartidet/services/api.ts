import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") return localStorage.getItem("auth_token");
  return SecureStore.getItemAsync("auth_token");
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
