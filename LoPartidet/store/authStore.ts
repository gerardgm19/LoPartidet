import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { create } from "zustand";
import { Role } from "@/types/role";

const TOKEN_KEY = "auth_token";
const USER_ID_KEY = "auth_user_id";
const ROLES_KEY = "auth_roles";

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
  roles: Role[];
  isLoading: boolean;
  initialize: () => Promise<void>;
  signIn: (token: string, userId: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUserId: (userId: string) => void;
  setRoles: (roles: Role[]) => Promise<void>;
  isAdmin: () => boolean;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: null,
  userId: null,
  roles: [],
  isLoading: true,

  initialize: async () => {
    const token = await storage.get(TOKEN_KEY);
    const userId = await storage.get(USER_ID_KEY);
    const rolesRaw = await storage.get(ROLES_KEY);
    const roles: Role[] = rolesRaw ? JSON.parse(rolesRaw) : [];
    set({ token, userId, roles, isLoading: false });
  },

  signIn: async (token, userId) => {
    await storage.set(TOKEN_KEY, token);
    set({ token });
  },

  signOut: async () => {
    await storage.del(TOKEN_KEY);
    await storage.del(USER_ID_KEY);
    await storage.del(ROLES_KEY);
    set({ token: null, userId: null, roles: [] });
  },

  setUserId: (userId) => set({ userId }),

  setRoles: async (roles) => {
    await storage.set(ROLES_KEY, JSON.stringify(roles));
    set({ roles });
  },

  isAdmin: () => get().roles.includes(Role.Admin),
}));
