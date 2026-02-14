import { ToastProvider } from "@/components/ui/toast";
import useAppDefault from "@/hooks/store/useAppDefault";
import AuthProvider, { useAuthContext } from "@/hooks/useAuthContext";
import { ThemeProvider } from "@/theme/theme-provider";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function handleRegistrationError(errorMessage: string) {
  console.error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!",
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
      return;
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log("Push token:", pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}

function RootNavigation() {
  const { isLoggedIn } = useAuthContext();
  const { setNotificationToken } = useAppDefault();

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          console.log("Token registered:", token);
          setNotificationToken?.(token);
        }
      })
      .catch((error: any) => console.error("Push registration error:", error));

    // Handle notification tap when app was killed
    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) {
      const data = lastResponse.notification.request.content.data;
      if (data?.meeting_id) {
        router.push(`/meeting/${data.meeting_id}`);
      }
    }

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification tapped:", response);
        const data = response.notification.request.content.data;
        if (data?.meeting_id) {
          router.push(`/meeting/${data.meeting_id}`);
        }
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [setNotificationToken]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
      </Stack.Protected>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="meeting/[id]" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <GestureHandlerRootView>
        <ThemeProvider>
          <ToastProvider>
            <RootNavigation />
            <StatusBar style="auto" />
          </ToastProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}
