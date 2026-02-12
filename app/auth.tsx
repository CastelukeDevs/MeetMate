import { Text } from "@/components/ui/text";
import useAppDefault from "@/hooks/store/useAppDefault";
import React from "react";
import { StyleSheet, View } from "react-native";

const Auth = () => {
  console.log("auth");

  const { isFirstTime } = useAppDefault();
  console.log("is first time?", isFirstTime);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text variant="body" style={{ color: "red" }}>
        AUTH
      </Text>
    </View>
  );
};

export default Auth;

const styles = StyleSheet.create({});
