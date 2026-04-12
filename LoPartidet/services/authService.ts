import axios from "axios";
import { Platform } from "react-native";

const DEBUG_BASE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5193"
    : "http://localhost:5193";

const PROD_BASE_URL = "http://178.33.119.182:5193";

const isDebug = true;

const BASE_URL = isDebug ? DEBUG_BASE_URL : PROD_BASE_URL;

const authClient = axios.create({
  headers: { "Content-Type": "application/json" },
});

export type AuthResponse = {
  userId: string;
  token: string;
};

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data } = await authClient.post<AuthResponse>(`${BASE_URL}/auth/login`, { email, password });
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) throw new Error("Invalid email or password.");
    throw new Error("Login failed. Please try again.");
  }
}

export async function register(
  email: string,
  password: string,
  name: string,
  surname: string,
  nickname: string
): Promise<AuthResponse> {
  try {
    const { data } = await authClient.post<AuthResponse>(`${BASE_URL}/auth/register`, {
      email,
      password,
      name,
      surname,
      nickname,
    });
    return data;
  } catch (error: any) {
    const body = error.response?.data;
    throw new Error(body?.error ?? "Registration failed. Please try again.");
  }
}
