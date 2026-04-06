import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { register } from "@/services/authService";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError(null);
    setLoading(true);
    try {
      const { token, userId } = await register(
        email.trim(),
        password,
        name.trim(),
        surname.trim(),
        nickname.trim()
      );
      await signIn(token, userId);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join LoPartidet</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Marc"
              placeholderTextColor={Colors.muted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Surname</Text>
            <TextInput
              style={styles.input}
              placeholder="Ribas"
              placeholderTextColor={Colors.muted}
              value={surname}
              onChangeText={setSurname}
            />

            <Text style={styles.label}>Nickname</Text>
            <TextInput
              style={styles.input}
              placeholder="mribas10"
              placeholderTextColor={Colors.muted}
              autoCapitalize="none"
              value={nickname}
              onChangeText={setNickname}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={Colors.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.muted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.black} />
              ) : (
                <Text style={styles.buttonText}>Register</Text>
              )}
            </Pressable>

            <Pressable onPress={() => router.back()}>
              <Text style={styles.link}>
                Already have an account?{" "}
                <Text style={styles.linkAccent}>Sign in</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.black },
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.green,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.muted,
    textAlign: "center",
    marginBottom: 40,
  },
  form: { gap: 12 },
  label: { fontSize: 13, color: Colors.muted, marginBottom: -4 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.white,
  },
  error: { fontSize: 13, color: "#FF5252", textAlign: "center" },
  button: {
    backgroundColor: Colors.green,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 16, fontWeight: "600", color: Colors.black },
  link: { fontSize: 14, color: Colors.muted, textAlign: "center", marginTop: 8 },
  linkAccent: { color: Colors.green },
});
