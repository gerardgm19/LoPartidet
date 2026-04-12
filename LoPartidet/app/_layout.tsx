import { useAuthStore } from "@/store/authStore";
import { useLangStore } from "@/store/langStore";
import { setUnauthorizedHandler } from "@/services/api";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

function RootNavigator() {
  const { token, isLoading, signOut, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const initLang = useLangStore((s) => s.initialize);

  useEffect(() => {
    initialize();
    initLang();
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
  }, [token, isLoading, segments]);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="match/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="player-details" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
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
