import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";

export default function Index() {
  const { token, isLoading } = useAuth();

  if (isLoading) return null;

  return <Redirect href={token ? "/(tabs)/matches" : "/(auth)/login"} />;
}
