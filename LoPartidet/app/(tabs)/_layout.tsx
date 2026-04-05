import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

function TabLabel({ label, color }: { label: string; color: string }) {
  return (
    <Text
      style={{
        color,
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 0.5,
      }}
    >
      {label}
    </Text>
  );
}

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.green,
        tabBarInactiveTintColor: Colors.muted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
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
          title: "Matches",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="football-outline" size={size} color={color} />
          ),
          tabBarLabel: ({ color }) => <TabLabel label="Matches" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          tabBarLabel: ({ color }) => <TabLabel label="Profile" color={color} />,
        }}
      />
    </Tabs>
  );
}
