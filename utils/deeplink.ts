import * as Notifications from "expo-notifications";
import { router } from "expo-router";

/**
 * Deeplink scheme: meetmate://
 *
 * Supported paths:
 * - meetmate://meeting/:id - Opens a specific meeting
 *
 * Notification data format:
 * - { meeting_id: string } - Opens meeting detail
 */

export type DeeplinkType = "meeting" | "unknown";

export interface DeeplinkData {
  type: DeeplinkType;
  id?: string;
  rawUrl?: string;
}

/**
 * Parse a deeplink URL into structured data
 */
export function parseDeeplink(url: string): DeeplinkData {
  try {
    // Handle meetmate:// scheme
    if (url.startsWith("meetmate://")) {
      const path = url.replace("meetmate://", "");
      const segments = path.split("/").filter(Boolean);

      if (segments[0] === "meeting" && segments[1]) {
        return { type: "meeting", id: segments[1], rawUrl: url };
      }
    }

    // Handle https://meetmate.app/ URLs (for universal links)
    if (url.includes("meetmate.app")) {
      const urlObj = new URL(url);
      const segments = urlObj.pathname.split("/").filter(Boolean);

      if (segments[0] === "meeting" && segments[1]) {
        return { type: "meeting", id: segments[1], rawUrl: url };
      }
    }

    return { type: "unknown", rawUrl: url };
  } catch {
    return { type: "unknown", rawUrl: url };
  }
}

/**
 * Parse notification data into deeplink data
 */
export function parseNotificationData(
  data: Record<string, unknown>,
): DeeplinkData | null {
  if (data?.meeting_id && typeof data.meeting_id === "string") {
    return { type: "meeting", id: data.meeting_id };
  }
  return null;
}

/**
 * Navigate based on deeplink data
 */
export function navigateToDeeplink(data: DeeplinkData): boolean {
  switch (data.type) {
    case "meeting":
      if (data.id) {
        router.push(`/meeting/${data.id}`);
        return true;
      }
      return false;
    default:
      console.warn("Unknown deeplink type:", data);
      return false;
  }
}

/**
 * Handle a notification response (tap)
 */
export function handleNotificationResponse(
  response: Notifications.NotificationResponse,
): boolean {
  const data = response.notification.request.content.data;
  const deeplinkData = parseNotificationData(data);

  if (deeplinkData) {
    return navigateToDeeplink(deeplinkData);
  }
  return false;
}

/**
 * Handle the last notification response (app was killed)
 */
export function handleLastNotificationResponse(): boolean {
  const lastResponse = Notifications.getLastNotificationResponse();
  if (lastResponse) {
    return handleNotificationResponse(lastResponse);
  }
  return false;
}

/**
 * Handle a URL deeplink
 */
export function handleUrlDeeplink(url: string): boolean {
  const data = parseDeeplink(url);
  return navigateToDeeplink(data);
}

/**
 * Trigger a test notification matching backend format
 * Only use in development
 */
export async function triggerTestNotification(
  meetingId: string,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Transcription Complete",
      body: "Your meeting has been transcribed and summarized.",
      data: { meeting_id: meetingId },
      sound: "default",
    },
    trigger: null, // Send immediately
  });
}
