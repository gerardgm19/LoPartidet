import { apiClient } from "./api";
import { API_BASE_URL } from "@/constants/env";
import { ConversationType } from "@/types/conversationType";

export type FriendDto = {
  id: number;
  name: string;
  surname: string;
  nickname: string;
  directConversationId?: string;
  friendshipId: string;
};

export type PendingRequestDto = {
  id: string;
  requesterId: number;
  requesterName: string;
  requesterNickname: string;
};

export type ConversationDto = {
  id: string;
  type: ConversationType;
  name?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  participantCount: number;
};

export type MessageDto = {
  id: string;
  conversationId: string;
  senderId: number;
  senderNickname: string;
  content: string;
  sentAt: string;
};

export async function getFriends(): Promise<FriendDto[]> {
  const { data } = await apiClient.get<FriendDto[]>(`${API_BASE_URL}/friendships`);
  return data;
}

export async function getPendingRequests(): Promise<PendingRequestDto[]> {
  const { data } = await apiClient.get<PendingRequestDto[]>(`${API_BASE_URL}/friendships/requests`);
  return data;
}

export async function sendFriendRequest(addresseeId: number): Promise<void> {
  await apiClient.post(`${API_BASE_URL}/friendships/request`, { addresseeId });
}

export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  await apiClient.put(`${API_BASE_URL}/friendships/${friendshipId}/accept`);
}

export async function blockUser(friendshipId: string): Promise<void> {
  await apiClient.put(`${API_BASE_URL}/friendships/${friendshipId}/block`);
}

export async function getGroupConversations(): Promise<ConversationDto[]> {
  const { data } = await apiClient.get<ConversationDto[]>(`${API_BASE_URL}/conversations/groups`);
  return data;
}

export async function getDirectConversations(): Promise<ConversationDto[]> {
  const { data } = await apiClient.get<ConversationDto[]>(`${API_BASE_URL}/conversations/direct`);
  return data;
}

export async function getMessages(
  conversationId: string,
  page = 1,
  pageSize = 50
): Promise<MessageDto[]> {
  const { data } = await apiClient.get<MessageDto[]>(
    `${API_BASE_URL}/conversations/${conversationId}/messages`,
    { params: { page, pageSize } }
  );
  return data;
}

export async function registerPushToken(token: string): Promise<void> {
  await apiClient.post(`${API_BASE_URL}/users/push-token`, { token });
}
