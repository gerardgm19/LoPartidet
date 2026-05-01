import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { useLangStore } from "@/store/langStore";
import {
  getFriends,
  getPendingRequests,
  getGroupConversations,
  sendFriendRequest,
  acceptFriendRequest,
  FriendDto,
  PendingRequestDto,
  ConversationDto,
} from "@/services/socialService";

type Tab = "friends" | "groups";

export default function SocialScreen() {
  const router = useRouter();
  const colors = useThemeStore((s) => s.colors);
  const t = useLangStore((s) => s.t);

  const [tab, setTab] = useState<Tab>("friends");

  const [friends, setFriends] = useState<FriendDto[]>([]);
  const [pending, setPending] = useState<PendingRequestDto[]>([]);
  const [groups, setGroups] = useState<ConversationDto[]>([]);
  const [loading, setLoading] = useState(false);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addUserId, setAddUserId] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  const loadFriendsData = useCallback(async () => {
    setLoading(true);
    try {
      const [f, p] = await Promise.all([getFriends(), getPendingRequests()]);
      setFriends(f);
      setPending(p);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGroupsData = useCallback(async () => {
    setLoading(true);
    try {
      const g = await getGroupConversations();
      setGroups(g);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "friends") loadFriendsData();
    else loadGroupsData();
  }, [tab]);

  const handleAccept = async (friendshipId: string) => {
    try {
      await acceptFriendRequest(friendshipId);
      await loadFriendsData();
    } catch {
      // ignore
    }
  };

  const handleSendRequest = async () => {
    const id = parseInt(addUserId, 10);
    if (isNaN(id)) {
      setAddError(t.validationRequired);
      return;
    }
    setAddLoading(true);
    setAddError("");
    try {
      await sendFriendRequest(id);
      setAddModalVisible(false);
      setAddUserId("");
    } catch {
      setAddError(t.friendRequestError);
    } finally {
      setAddLoading(false);
    }
  };

  const styles = makeStyles(colors);

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.social}</Text>
        {tab === "friends" && (
          <TouchableOpacity onPress={() => setAddModalVisible(true)}>
            <Ionicons name="person-add-outline" size={22} color={colors.green} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "friends" && styles.tabBtnActive]}
          onPress={() => setTab("friends")}
        >
          <Text style={[styles.tabLabel, tab === "friends" && styles.tabLabelActive]}>
            {t.friends}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "groups" && styles.tabBtnActive]}
          onPress={() => setTab("groups")}
        >
          <Text style={[styles.tabLabel, tab === "groups" && styles.tabLabelActive]}>
            {t.groups}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.green} />
      ) : tab === "friends" ? (
        <FlatList
          data={[...pending.map((p) => ({ ...p, isPending: true })), ...friends.map((f) => ({ ...f, isPending: false }))]}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={styles.empty}>{t.noFriends}</Text>
          }
          ListHeaderComponent={
            pending.length > 0 ? (
              <Text style={styles.sectionLabel}>{t.pendingRequests}</Text>
            ) : null
          }
          renderItem={({ item }) => {
            if ("isPending" in item && item.isPending) {
              const req = item as PendingRequestDto & { isPending: boolean };
              return (
                <View style={styles.card}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{req.requesterName}</Text>
                    <Text style={styles.cardSub}>@{req.requesterNickname}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAccept(req.id)}
                  >
                    <Text style={styles.acceptBtnText}>{t.accept}</Text>
                  </TouchableOpacity>
                </View>
              );
            }
            const friend = item as FriendDto & { isPending: boolean };
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  if (friend.directConversationId)
                    router.push(`/chat/${friend.directConversationId}`);
                }}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {friend.name[0]}{friend.surname[0]}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{friend.name} {friend.surname}</Text>
                  <Text style={styles.cardSub}>@{friend.nickname}</Text>
                </View>
                {friend.directConversationId && (
                  <Ionicons name="chatbubble-outline" size={18} color={colors.muted} />
                )}
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={styles.empty}>{t.noGroups}</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/chat/${item.id}`)}
            >
              <View style={[styles.avatar, { backgroundColor: colors.card }]}>
                <Ionicons name="football-outline" size={20} color={colors.green} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.name ?? t.groups}</Text>
                {item.lastMessage ? (
                  <Text style={styles.cardSub} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                ) : (
                  <Text style={styles.cardSub}>{item.participantCount} {t.players}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={addModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.addFriend}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t.addFriendPlaceholder}
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              value={addUserId}
              onChangeText={setAddUserId}
            />
            {addError ? <Text style={styles.errorText}>{addError}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setAddModalVisible(false); setAddUserId(""); setAddError(""); }}
              >
                <Text style={styles.cancelBtnText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={handleSendRequest}
                disabled={addLoading}
              >
                {addLoading ? (
                  <ActivityIndicator size="small" color={colors.black} />
                ) : (
                  <Text style={styles.sendBtnText}>{t.sendRequest}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>["colors"]) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.black },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    title: { fontSize: 24, fontWeight: "700", color: colors.white },
    tabBar: {
      flexDirection: "row",
      marginHorizontal: 16,
      marginBottom: 8,
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 4,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      borderRadius: 8,
    },
    tabBtnActive: { backgroundColor: colors.card },
    tabLabel: { fontSize: 13, fontWeight: "600", color: colors.muted },
    tabLabelActive: { color: colors.white },
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      gap: 12,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.green,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { color: colors.black, fontWeight: "700", fontSize: 14 },
    cardInfo: { flex: 1 },
    cardName: { color: colors.white, fontWeight: "600", fontSize: 15 },
    cardSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
    acceptBtn: {
      backgroundColor: colors.green,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 8,
    },
    acceptBtnText: { color: colors.black, fontWeight: "700", fontSize: 13 },
    sectionLabel: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: 0.5,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    empty: {
      color: colors.muted,
      textAlign: "center",
      marginTop: 40,
      fontSize: 15,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    modalCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      width: "100%",
      gap: 16,
    },
    modalTitle: { color: colors.white, fontSize: 18, fontWeight: "700" },
    modalInput: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 14,
      color: colors.white,
      fontSize: 15,
    },
    modalActions: { flexDirection: "row", gap: 12 },
    cancelBtn: {
      flex: 1,
      padding: 14,
      borderRadius: 10,
      backgroundColor: colors.card,
      alignItems: "center",
    },
    cancelBtnText: { color: colors.white, fontWeight: "600" },
    sendBtn: {
      flex: 1,
      padding: 14,
      borderRadius: 10,
      backgroundColor: colors.green,
      alignItems: "center",
    },
    sendBtnText: { color: colors.black, fontWeight: "700" },
    errorText: { color: colors.red, fontSize: 13 },
  });
}
