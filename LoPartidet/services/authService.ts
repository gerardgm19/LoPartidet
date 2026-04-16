import axios from "axios";
import { API_BASE_URL, AUTH_BASE_URL } from "@/constants/env";

const authClient = axios.create({
  headers: { "Content-Type": "application/json" },
});

export type AuthResponse = {
  userId: string;
  token: string;
};

type RegisterApiResponse = {
  user: { id: number };
  token: string;
};

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data } = await authClient.post<AuthResponse>(`${AUTH_BASE_URL}/auth/login`, { email, password });
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
    const { data } = await authClient.post<RegisterApiResponse>(`${API_BASE_URL}/users`, {
      name,
      surname,
      nickname,
      email,
      password,
      city: "",
    });
    return { token: data.token, userId: data.user.id.toString() };
  } catch (error: any) {
    const body = error.response?.data;
    throw new Error(body?.error ?? "Registration failed. Please try again.");
  }
}
