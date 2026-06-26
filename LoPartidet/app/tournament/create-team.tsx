import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";
import { addTeam } from "@/services/tournamentsService";
import { getUserById, User } from "@/services/usersService";
import { useAuthStore } from "@/store/authStore";
import { useLangStore } from "@/store/langStore";
import { Toast } from "@/components/Toast";

const useStyles = makeStyles((colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  flex: { flex: 1 },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    justifyContent: "center", alignItems: "center",
  },
  navTitle: { color: colors.white, fontSize: 16, fontWeight: "700" },
  navPlaceholder: { width: 38 },
  scroll: { paddingHorizontal: 16, paddingBottom: 32, gap: 16 },
  section: {
    backgroundColor: colors.card,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.border,
    gap: 12,
  },
  label: { color: colors.muted, fontSize: 13, fontWeight: "600", letterSpacing: 0.4, textTransform: "uppercase" },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 12,
    color: colors.white, fontSize: 15,
  },
  memberRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  memberInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 12,
    color: colors.white, fontSize: 15,
  },
  addBtn: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: colors.green,
    alignItems: "center", justifyContent: "center",
  },
  memberList: { gap: 8 },
  memberItem: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  memberItemMe: {
    borderColor: colors.green,
  },
  memberInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  memberAvatar: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: colors.green,
    alignItems: "center", justifyContent: "center",
  },
  memberAvatarOther: {
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  memberAvatarText: { color: colors.black, fontSize: 11, fontWeight: "800" },
  memberAvatarTextOther: { color: colors.muted },
  memberName: { color: colors.white, fontSize: 14, fontWeight: "600" },
  memberYou: { color: colors.green, fontSize: 11, fontWeight: "700" },
  removeBtn: { padding: 4 },
  submitButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.green,
  },
  submitButtonText: { color: colors.black, fontSize: 16, fontWeight: "800" },
}));

type MemberEntry = { id: number; label: string; isMe: boolean };

export default function CreateTeamPage() {
  const t = useLangStore((s) => s.t);
  const colors = useThemeStore((s) => s.colors);
  const styles = useStyles();
  const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();
  const userId = useAuthStore((s) => s.userId);

  const [currentUser, setCurrentUser] = useState<User | undefined>();
  const [name, setName] = useState("");
  const [memberIdInput, setMemberIdInput] = useState("");
  const [members, setMembers] = useState<MemberEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (!userId) return;
    const myId = parseInt(userId, 10);
    getUserById(myId).then((user) => {
      if (!user) return;
      setCurrentUser(user);
      setMembers([{ id: myId, label: `${user.name} ${user.surname}`, isMe: true }]);
    });
  }, [userId]);

  const handleAddMember = () => {
    const parsed = parseInt(memberIdInput.trim(), 10);
    if (!isNaN(parsed) && !members.some((m) => m.id === parsed)) {
      setMembers((prev) => [...prev, { id: parsed, label: `#${parsed}`, isMe: false }]);
    }
    setMemberIdInput("");
  };

  const handleRemoveMember = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = async () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      const memberUserIds = members.map((m) => m.id);
      await addTeam(tournamentId, { name: name.trim(), createdBy: userId ?? "", memberUserIds: memberUserIds.length > 0 ? memberUserIds : null });
      setToastMessage(t.createTeamSuccess);
      setToastVisible(true);
      setTimeout(() => router.replace(`/tournament/${tournamentId}`), 1200);
    } catch (error: any) {
      const msg: string = error.response?.data ?? "";
      if (msg.includes("already")) {
        setToastMessage(t.createTeamAlreadyInTeam);
      } else if (msg.includes("full")) {
        setToastMessage(t.createTeamFull);
      } else {
        setToastMessage(t.createTeamError);
      }
      setToastVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  const myId = userId ? parseInt(userId, 10) : -1;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>

        <View style={styles.navbar}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
          <Text style={styles.navTitle}>{t.createTeamTitle}</Text>
          <View style={styles.navPlaceholder} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          <View style={styles.section}>
            <Text style={styles.label}>{t.teamName}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.teamNamePlaceholder}
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{t.teamMembers}</Text>

            <View style={styles.memberList}>
              {members.map((member) => {
                const initials = member.isMe && currentUser
                  ? (currentUser.name[0] ?? "") + (currentUser.surname[0] ?? "")
                  : member.label.slice(0, 2).toUpperCase();
                return (
                  <View key={member.id} style={[styles.memberItem, member.isMe && styles.memberItemMe]}>
                    <View style={styles.memberInfo}>
                      <View style={[styles.memberAvatar, !member.isMe && styles.memberAvatarOther]}>
                        <Text style={[styles.memberAvatarText, !member.isMe && styles.memberAvatarTextOther]}>
                          {initials}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.memberName}>{member.label}</Text>
                        {member.isMe && <Text style={styles.memberYou}>{t.you}</Text>}
                      </View>
                    </View>
                    {!member.isMe && (
                      <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveMember(member.id)}>
                        <Ionicons name="close-circle" size={20} color={colors.muted} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>

            <View style={styles.memberRow}>
              <TextInput
                style={styles.memberInput}
                placeholder={t.memberIdPlaceholder}
                placeholderTextColor={colors.muted}
                value={memberIdInput}
                onChangeText={setMemberIdInput}
                keyboardType="numeric"
                onSubmitEditing={handleAddMember}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.addBtn} onPress={handleAddMember}>
                <Ionicons name="add" size={24} color={colors.black} />
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>

        <Pressable
          style={({ pressed }) => [styles.submitButton, pressed && { opacity: 0.8 }, (!name.trim() || submitting) && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={!name.trim() || submitting}
        >
          {submitting
            ? <ActivityIndicator color={colors.black} size="small" />
            : <Text style={styles.submitButtonText}>{t.createTeamBtn}</Text>
          }
        </Pressable>

      </KeyboardAvoidingView>

      <Toast message={toastMessage} visible={toastVisible} onHide={() => setToastVisible(false)} />
    </SafeAreaView>
  );
}
