import { create } from "zustand";
import { MessageDto } from "@/services/socialService";

type ChatStore = {
  messages: Record<string, MessageDto[]>;
  addMessage: (msg: MessageDto) => void;
  setMessages: (conversationId: string, msgs: MessageDto[]) => void;
  clearMessages: (conversationId: string) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: {},

  addMessage: (msg) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [msg.conversationId]: [
          ...(state.messages[msg.conversationId] ?? []),
          msg,
        ],
      },
    })),

  setMessages: (conversationId, msgs) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: msgs },
    })),

  clearMessages: (conversationId) =>
    set((state) => {
      const next = { ...state.messages };
      delete next[conversationId];
      return { messages: next };
    }),
}));
