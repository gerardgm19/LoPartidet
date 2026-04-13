import axios from "axios";
import { AUTH_BASE_URL } from "@/constants/env";

const BASE_URL = AUTH_BASE_URL;

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
