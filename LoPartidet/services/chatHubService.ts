import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr";
import { API_BASE_URL } from "@/constants/env";
import { MessageDto } from "./socialService";

let connection: HubConnection | null = null;

export async function connectHub(
  token: string,
  onMessage: (msg: MessageDto) => void,
  onError: (err: string) => void
): Promise<void> {
  connection = new HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/hubs/chat`, {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  connection.on("ReceiveMessage", onMessage);
  connection.on("Error", onError);

  await connection.start();
}

export async function joinConversation(conversationId: string): Promise<void> {
  await connection?.invoke("JoinConversation", conversationId);
}

export async function leaveConversation(conversationId: string): Promise<void> {
  await connection?.invoke("LeaveConversation", conversationId);
}

export async function sendHubMessage(
  conversationId: string,
  content: string
): Promise<void> {
  await connection?.invoke("SendMessage", conversationId, content);
}

export async function disconnectHub(): Promise<void> {
  await connection?.stop();
  connection = null;
}

export function isConnected(): boolean {
  return connection?.state === "Connected";
}
