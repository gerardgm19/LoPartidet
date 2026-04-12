import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useLangStore } from "@/store/langStore";
import { useAuthStore } from "@/store/authStore";
import { Lang } from "@/i18n";

export default function Profile() {
  const t = useLangStore((s) => s.t);
  const { lang, setLang } = useLangStore();
  const { signOut } = useAuthStore();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);

  async function handleSignOut() {
    setSignOutModalVisible(false);
    await signOut();
    router.replace("/(auth)/login");
  }

  const LANGUAGES: { value: Lang; label: string }[] = [
    { value: "es_es", label: t.langSpanish },
    { value: "cat_es", label: t.langCatalan },
  ];

  const menuItems = [
    { label: t.playerDetails, route: "/player-details" },
    { label: t.settings, route: "/settings" },
    { label: t.aboutUs, route: "/about-us" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t.profile}</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>?</Text>
        </View>
        <Text style={styles.name}>{t.guestUser}</Text>
        <Text style={styles.sub}>{t.noAccountYet}</Text>
        <View style={styles.divider} />
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>{t.statMatches}</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>{t.statGoals}</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>{t.statWins}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, styles.menuItemBorder]}
              onPress={() => router.push(item.route as any)}
            >
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => setLangModalVisible(true)}
          >
            <Text style={styles.menuLabel}>{t.language}</Text>
            <View style={styles.langRight}>
              <Text style={styles.langCurrent}>
                {LANGUAGES.find((l) => l.value === lang)?.label}
              </Text>
              <Text style={styles.menuChevron}>›</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setSignOutModalVisible(true)}
          >
            <Text style={[styles.menuLabel, styles.signOutLabel]}>{t.signOut}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={signOutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSignOutModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSignOutModalVisible(false)}>
          <View style={styles.dialogSheet}>
            <Text style={styles.dialogTitle}>{t.signOutConfirmTitle}</Text>
            <Text style={styles.dialogMessage}>{t.signOutConfirmMessage}</Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={[styles.dialogBtn, styles.dialogBtnCancel]}
                onPress={() => setSignOutModalVisible(false)}
              >
                <Text style={styles.dialogBtnCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogBtn, styles.dialogBtnConfirm]}
                onPress={handleSignOut}
              >
                <Text style={styles.dialogBtnConfirmText}>{t.confirm}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLangModalVisible(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{t.selectLanguage}</Text>
            {LANGUAGES.map((l) => (
              <TouchableOpacity
                key={l.value}
                style={styles.modalOption}
                onPress={() => { setLang(l.value); setLangModalVisible(false); }}
              >
                <Text style={[styles.modalOptionText, lang === l.value && styles.modalOptionActive]}>
                  {l.label}
                </Text>
                {lang === l.value && (
                  <Ionicons name="checkmark" size={18} color={Colors.green} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  scroll: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: "center",
  },
  title: {
    alignSelf: "flex-start",
    color: Colors.white,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 36,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.card,
    borderWidth: 3,
    borderColor: Colors.green,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: { color: Colors.green, fontSize: 36, fontWeight: "700" },
  name: { color: Colors.white, fontSize: 22, fontWeight: "700", marginBottom: 4 },
  sub: { color: Colors.muted, fontSize: 14 },
  divider: { width: "100%", height: 1, backgroundColor: Colors.border, marginVertical: 32 },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  stat: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { color: Colors.green, fontSize: 28, fontWeight: "800" },
  statLabel: { color: Colors.muted, fontSize: 12, fontWeight: "600", letterSpacing: 0.5 },
  statSep: { width: 1, height: 40, backgroundColor: Colors.border },
  menu: { width: "100%", backgroundColor: Colors.card, borderRadius: 16 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuLabel: { color: Colors.white, fontSize: 16, fontWeight: "500" },
  menuChevron: { color: Colors.muted, fontSize: 22, lineHeight: 24 },
  langRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  langCurrent: { color: Colors.muted, fontSize: 14 },
  signOutLabel: { color: "#FF5252" },

  // Sign-out dialog
  dialogSheet: {
    margin: 32,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    gap: 8,
  },
  dialogTitle: { color: Colors.white, fontSize: 17, fontWeight: "700", textAlign: "center" },
  dialogMessage: { color: Colors.muted, fontSize: 14, textAlign: "center", marginBottom: 8 },
  dialogActions: { flexDirection: "row", gap: 12, marginTop: 4 },
  dialogBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: "center" },
  dialogBtnCancel: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  dialogBtnCancelText: { color: Colors.white, fontSize: 15, fontWeight: "600" },
  dialogBtnConfirm: { backgroundColor: "#FF5252" },
  dialogBtnConfirmText: { color: Colors.white, fontSize: 15, fontWeight: "700" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 4,
  },
  modalTitle: {
    color: Colors.muted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalOptionText: { color: Colors.white, fontSize: 16, fontWeight: "500" },
  modalOptionActive: { color: Colors.green, fontWeight: "700" },
});
