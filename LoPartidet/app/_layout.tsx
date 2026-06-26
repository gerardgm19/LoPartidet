import { useAuthStore } from "@/store/authStore";
import { useLangStore } from "@/store/langStore";
import { useThemeStore } from "@/store/themeStore";
import { setUnauthorizedHandler } from "@/services/api";
import { getMe } from "@/services/usersService";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LoadingScreen from "@/components/LoadingScreen";

function RootNavigator() {
  const { token, userId, isLoading, signOut, initialize, setUserId } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const initLang = useLangStore((s) => s.initialize);
  const initTheme = useThemeStore((s) => s.initialize);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    Promise.all([
      Promise.resolve(initialize()),
      Promise.resolve(initLang()),
      Promise.resolve(initTheme()),
    ]).finally(() => setBootstrapped(true));
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
      getMe()
        .then(async (me) => {
          if (me) {
            setUserId(me.userId.toString());
          } else {
            await signOut();
            router.replace("/(auth)/login");
          }
        })
        .catch(async () => {
          await signOut();
          router.replace("/(auth)/login");
        });
    }
  }, [token, isLoading, segments]);

  if (!bootstrapped || isLoading) return <LoadingScreen />;

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="match/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="match/create-match" options={{ headerShown: false }} />
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
