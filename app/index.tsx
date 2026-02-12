import { SplashScreen, useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // const timeout = setTimeout(() => {
    //   router.replace("/onboard");
    // }, 0);
    // return () => clearTimeout(timeout);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    ></View>
  );
}
