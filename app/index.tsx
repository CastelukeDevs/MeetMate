import useAppDefault from "@/hooks/store/useAppDefault";
import { useAuthContext } from "@/hooks/useAuthContext";
import { router, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { isLoading, isLoggedIn } = useAuthContext();
  const { isFirstTime } = useAppDefault();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();

      if (isFirstTime && !isLoggedIn) {
        router.replace("/onboarding");
      } else if (!isFirstTime && !isLoggedIn) {
        router.replace("/auth");
      } else {
        router.replace("/(tabs)");
      }
    }
  }, [isLoading, isFirstTime, isLoggedIn]);

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
