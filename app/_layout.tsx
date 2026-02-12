import { ToastProvider } from "@/components/ui/toast";
import AuthProvider, { useAuthContext } from "@/hooks/useAuthContext";
import { ThemeProvider } from "@/theme/theme-provider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function RootNavigation() {
  const { isLoggedIn } = useAuthContext();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
      </Stack.Protected>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="meeting" />
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
