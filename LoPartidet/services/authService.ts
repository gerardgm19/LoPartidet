import { Platform } from "react-native";

const DEBUG_BASE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5193"
    : "http://localhost:5193";

const PROD_BASE_URL = "http://178.33.119.182:5193";

const isDebug = true;

const BASE_URL = isDebug ? DEBUG_BASE_URL : PROD_BASE_URL;

export type AuthResponse = {
  userId: string;
  token: string;
};

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (response.status === 401) throw new Error("Invalid email or password.");
  if (!response.ok) throw new Error("Login failed. Please try again.");

  return response.json();
}

export async function register(
  email: string,
  password: string,
  name: string,
  surname: string,
  nickname: string
): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name, surname, nickname }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Registration failed. Please try again.");
  }

  return response.json();
}
