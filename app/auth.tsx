import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { GroupedInput, GroupedInputItem } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { useColor } from "@/hooks/useColor";
import { supabase } from "@/utils/supabase";
import { Eye, EyeClosed, Lock, Mail, NotebookPen } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type AuthError = {
  key: "email" | "password" | "confirmPassword" | "general";
  message: string;
};

const Auth = () => {
  const { toast } = useToast();
  const color = useColor("accentForeground");

  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordSecured, setPasswordSecured] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordSecured, setConfirmPasswordSecured] = useState(true);
  const [formError, setFormError] = useState<AuthError | undefined>();

  const validateForm = () => {
    if (!email) {
      setFormError({ key: "email", message: " Email is required." });
      return false;
    } else if (!password) {
      setFormError({ key: "password", message: " Password is required." });
      return false;
    } else if (!isSignIn && password !== confirmPassword) {
      setFormError({
        key: "confirmPassword",
        message: " Passwords do not match.",
      });
      return false;
    } else if (!isSignIn && password.length < 6) {
      setFormError({
        key: "password",
        message: " Password must be at least 6 characters.",
      });
      return false;
    } else return true;
  };

  const toggleSignIn = () => {
    setIsSignIn(!isSignIn);
    setFormError(undefined);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  async function signUpHandler() {
    const isValid = validateForm();

    if (!isValid) return;

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      setFormError({ key: "general", message: error.message });
      console.log("error", error.message);
      return;
    }
    toast({
      title: "Sign Up Success",
      description:
        "Account created successfully. Please sign in with your new account.",
      variant: "success",
    });

    setIsSignIn(true);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }

  async function signInHandler() {
    const isValid = validateForm();

    if (!isValid) return;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setFormError({ key: "general", message: error.message });
      console.log("error", error.message);
      return;
    }

    console.log("");
  }

  return (
    <View style={styles.root}>
      <View style={styles.headerContainer}>
        <View style={styles.brandingContainer}>
          <View style={[styles.logoContainer, { borderColor: color }]}>
            <NotebookPen size={32} color={color} />
          </View>
          <Text variant="title" style={{ color: color }}>
            Meet Mate
          </Text>
        </View>
      </View>
      <View style={styles.bodyContainer}>
        <GroupedInput title={isSignIn ? "Sign In" : "Sign Up"}>
          <GroupedInputItem
            label="Email"
            placeholder="john@example.com"
            icon={Mail}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            error={
              formError?.key === "email" || formError?.key === "general"
                ? formError.message
                : undefined
            }
          />
          <GroupedInputItem
            label="Password"
            placeholder="Enter your password"
            icon={Lock}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={passwordSecured}
            rightComponent={() => (
              <IconEye
                isActive={passwordSecured}
                onPress={() => setPasswordSecured(!passwordSecured)}
              />
            )}
            error={
              formError?.key === "password" || formError?.key === "general"
                ? formError.message
                : undefined
            }
          />
          {!isSignIn && (
            <GroupedInputItem
              label="Confirm"
              placeholder="Confirm your password"
              icon={Lock}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={confirmPasswordSecured}
              error={
                formError?.key === "confirmPassword" ||
                formError?.key === "general"
                  ? formError.message
                  : undefined
              }
              rightComponent={() => (
                <IconEye
                  isActive={confirmPasswordSecured}
                  onPress={() =>
                    setConfirmPasswordSecured(!confirmPasswordSecured)
                  }
                />
              )}
            />
          )}
        </GroupedInput>
        <Button onPress={isSignIn ? signInHandler : signUpHandler}>
          {isSignIn ? "Sign In" : "Sign Up"}
        </Button>
        <Text
          style={{ textAlign: "center", color: color }}
          onPress={toggleSignIn}
          variant="link"
        >
          {isSignIn
            ? "Don't have an account? Sign Up"
            : "Already have an account? Sign In"}
        </Text>
      </View>
    </View>
  );
};

const IconEye = ({
  isActive,
  onPress,
}: {
  isActive: boolean;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={20}>
      {isActive ? (
        <Icon name={Eye} size={20} />
      ) : (
        <Icon name={EyeClosed} size={20} />
      )}
    </TouchableOpacity>
  );
};

export default Auth;

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "center" },
  headerContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  brandingContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  logoContainer: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 16,
  },
  bodyContainer: { flex: 3, gap: 16, paddingHorizontal: 24 },
});
