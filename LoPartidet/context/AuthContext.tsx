import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { createContext, useContext, useEffect, useState } from "react";

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

type AuthState = {
  token: string | null;
  userId: string | null;
  isLoading: boolean;
  signIn: (token: string, userId: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  token: null,
  userId: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedToken = await storage.get(TOKEN_KEY);
      const storedUserId = await storage.get(USER_ID_KEY);
      setToken(storedToken);
      setUserId(storedUserId);
      setIsLoading(false);
    })();
  }, []);

  async function signIn(newToken: string, newUserId: string) {
    await storage.set(TOKEN_KEY, newToken);
    await storage.set(USER_ID_KEY, newUserId);
    setToken(newToken);
    setUserId(newUserId);
  }

  async function signOut() {
    await storage.del(TOKEN_KEY);
    await storage.del(USER_ID_KEY);
    setToken(null);
    setUserId(null);
  }

  return (
    <AuthContext.Provider value={{ token, userId, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
