import { SplashScreenController } from "@/components/splash-screen-controller";
import AuthProvider, { useAuthContext } from "@/hooks/useAuthContext";
import { ThemeProvider } from "@/theme/theme-provider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function RootNavigation() {
  const { isLoggedIn } = useAuthContext();

  console.log("user is logged in?", isLoggedIn);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboard" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <GestureHandlerRootView>
        <ThemeProvider>
          <SplashScreenController />
          <RootNavigation />
          <StatusBar style="auto" />
        </ThemeProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}
