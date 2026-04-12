import { useAuthStore } from "@/store/authStore";
import { Redirect } from "expo-router";

export default function Index() {
  const { token, isLoading } = useAuthStore();

  if (isLoading) return null;

  return <Redirect href={token ? "/(tabs)/matches" : "/(auth)/login"} />;
}
