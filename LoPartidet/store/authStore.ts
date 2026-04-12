import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { create } from "zustand";

const TOKEN_KEY = "auth_token";
const USER_ID_KEY = "auth_user_id";

const storage = {
  async get(key: string) {
    if (Platform.OS === "web") return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string) {
    if (Platform.OS === "web") { localStorage.setItem(key, value); return; }
    return SecureStore.setItemAsync(key, value);
  },
  async del(key: string) {
    if (Platform.OS === "web") { localStorage.removeItem(key); return; }
    return SecureStore.deleteItemAsync(key);
  },
};

type AuthStore = {
  token: string | null;
  userId: string | null;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signIn: (token: string, userId: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  userId: null,
  isLoading: true,

  initialize: async () => {
    const token = await storage.get(TOKEN_KEY);
    const userId = await storage.get(USER_ID_KEY);
    set({ token, userId, isLoading: false });
  },

  signIn: async (token, userId) => {
    await storage.set(TOKEN_KEY, token);
    await storage.set(USER_ID_KEY, userId);
    set({ token, userId });
  },

  signOut: async () => {
    await storage.del(TOKEN_KEY);
    await storage.del(USER_ID_KEY);
    set({ token: null, userId: null });
  },
}));
