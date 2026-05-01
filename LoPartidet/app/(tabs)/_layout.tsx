import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/themeStore";
import { useLangStore } from "@/store/langStore";

function TabLabel({ label, color }: { label: string; color: string }) {
  return (
    <Text style={{ color, fontSize: 11, fontWeight: "600", letterSpacing: 0.5 }}>
      {label}
    </Text>
  );
}

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();
  const t = useLangStore((s) => s.t);
  const colors = useThemeStore((s) => s.colors);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: bottom + 8,
          paddingTop: 8,
          height: 65 + bottom,
        },
      }}
    >
      <Tabs.Screen
        name="matches"
        options={{
          title: t.matches,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="football-outline" size={size} color={color} />
          ),
          tabBarLabel: ({ color }) => <TabLabel label={t.matches} color={color} />,
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: "",
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <View style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: colors.green,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 8,
              shadowColor: colors.green,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <Ionicons name="add" size={28} color={colors.black} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="social"
        options={{
          title: t.social,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
          tabBarLabel: ({ color }) => <TabLabel label={t.social} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t.profile,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          tabBarLabel: ({ color }) => <TabLabel label={t.profile} color={color} />,
        }}
      />
    </Tabs>
  );
}
