import { useAuthStore } from "@/store/authStore";
import { useLangStore } from "@/store/langStore";
import { useThemeStore } from "@/store/themeStore";
import { setUnauthorizedHandler } from "@/services/api";
import { getMe } from "@/services/usersService";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

function RootNavigator() {
  const { token, userId, isLoading, signOut, initialize, setUserId } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const initLang = useLangStore((s) => s.initialize);
  const initTheme = useThemeStore((s) => s.initialize);

  useEffect(() => {
    initialize();
    initLang();
    initTheme();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await signOut();
      router.replace("/(auth)/login");
    });
  }, [signOut, router]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!token && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (token && inAuthGroup) {
      router.replace("/(tabs)/matches");
    }
    if (token && !userId) {
      getMe().then((userId) => {
        console.log(userId)
        if (userId) setUserId(userId.toString());
      });
    }
  }, [token, isLoading, segments]);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="match/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="skills" options={{ headerShown: false }} />
      <Stack.Screen name="player-information" options={{ headerShown: false }} />
      <Stack.Screen name="about-us" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
