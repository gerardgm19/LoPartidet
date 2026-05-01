import { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { useLangStore } from "@/store/langStore";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { getMessages, MessageDto } from "@/services/socialService";
import {
  connectHub,
  disconnectHub,
  joinConversation,
  leaveConversation,
  sendHubMessage,
} from "@/services/chatHubService";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((s) => s.colors);
  const t = useLangStore((s) => s.t);
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.userId);
  const { messages, setMessages, addMessage } = useChatStore();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const conversationMessages = messages[id] ?? [];
  const myId = parseInt(userId ?? "0", 10);

  const onReceive = useCallback(
    (msg: MessageDto) => {
      const already = (messages[msg.conversationId] ?? []).some((m) => m.id === msg.id);
      if (!already) addMessage(msg);
    },
    [messages, addMessage]
  );

  useEffect(() => {
    let mounted = true;

    async function setup() {
      try {
        const history = await getMessages(id);
        if (mounted) setMessages(id, [...history].reverse());
      } catch {
        if (mounted) setError(t.chatError);
      } finally {
        if (mounted) setLoading(false);
      }

      try {
        await connectHub(token!, onReceive, () => {});
        await joinConversation(id);
      } catch {
        // Hub connection optional; messages still loadable via REST
      }
    }

    setup();

    return () => {
      mounted = false;
      leaveConversation(id).catch(() => {});
      disconnectHub().catch(() => {});
    };
  }, [id]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content) return;
    setInput("");
    setSending(true);
    try {
      await sendHubMessage(id, content);
    } catch {
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const styles = makeStyles(colors);

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t.social}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <ActivityIndicator style={{ flex: 1 }} color={colors.green} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <FlatList
            ref={flatListRef}
            data={conversationMessages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => {
              const isMe = item.senderId === myId;
              return (
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                  {!isMe && (
                    <Text style={styles.senderName}>{item.senderNickname}</Text>
                  )}
                  <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
                    {item.content}
                  </Text>
                  <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
                    {new Date(item.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
              );
            }}
          />
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={t.typeMessage}
            placeholderTextColor={colors.muted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={2000}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.black} />
            ) : (
              <Ionicons name="send" size={18} color={colors.black} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>["colors"]) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.black },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    backBtn: { padding: 2 },
    headerTitle: {
      flex: 1,
      color: colors.white,
      fontSize: 17,
      fontWeight: "600",
    },
    messageList: {
      padding: 16,
      gap: 8,
    },
    bubble: {
      maxWidth: "75%",
      padding: 12,
      borderRadius: 16,
      marginBottom: 6,
    },
    bubbleOther: {
      backgroundColor: colors.surface,
      alignSelf: "flex-start",
      borderBottomLeftRadius: 4,
    },
    bubbleMe: {
      backgroundColor: colors.green,
      alignSelf: "flex-end",
      borderBottomRightRadius: 4,
    },
    senderName: {
      color: colors.muted,
      fontSize: 11,
      fontWeight: "600",
      marginBottom: 4,
    },
    bubbleText: { color: colors.white, fontSize: 15 },
    bubbleTextMe: { color: colors.black },
    bubbleTime: {
      color: colors.muted,
      fontSize: 10,
      marginTop: 4,
      textAlign: "right",
    },
    bubbleTimeMe: { color: "rgba(0,0,0,0.5)" },
    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      padding: 12,
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
    input: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      color: colors.white,
      fontSize: 15,
      maxHeight: 120,
    },
    sendBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.green,
      alignItems: "center",
      justifyContent: "center",
    },
    sendBtnDisabled: { opacity: 0.5 },
    errorText: {
      color: colors.red,
      textAlign: "center",
      marginTop: 40,
      fontSize: 15,
    },
  });
}
