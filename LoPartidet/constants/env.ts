import Constants from "expo-constants";
import { Platform } from "react-native";

const extra = Constants.expoConfig?.extra ?? {};

function resolveUrl(debug: string, prod: string): string {
  if (!isDebug) return prod;
  return debug;
}

const isDebug = false;
const apiIdentityCloudflareUrl: string = "https://identity.lopartidet.cat";
const apiLoPartidetCloudflareUrl: string = "https://api.lopartidet.cat";
const apiIdentityLocalhostUrl: string = "http://localhost:10002";
const apiLoPartidetLocalhostUrl: string = "http://localhost:10004";
const apiAndroidIdentityIpUrl: string = "http://127.0.0.1:10001";
const apiAndroidLoPartidetIprl: string = "http://127.0.0.1:10003";

export const AUTH_BASE_URL: string = resolveUrl(
  apiAndroidIdentityIpUrl, //apiIdentityLocalhostUrl,
  apiIdentityCloudflareUrl,
);

export const API_BASE_URL: string = resolveUrl(
  apiAndroidLoPartidetIprl, // apiLoPartidetLocalhostUrl,
  apiLoPartidetCloudflareUrl,
);