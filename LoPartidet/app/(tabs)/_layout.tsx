import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
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
            <View style={styles.createBtn}>
              <Ionicons name="add" size={28} color={Colors.black} />
            </View>
          ),
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

const styles = StyleSheet.create({
  createBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.green,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
