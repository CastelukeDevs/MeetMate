import { Button } from "@/components/ui/button";
import { GroupedInput, GroupedInputItem } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { View } from "@/components/ui/view";
import useAppDefault from "@/hooks/store/useAppDefault";
import { useAuthContext } from "@/hooks/useAuthContext";
import { removeDeviceToken, updateProfile } from "@/utils/profileManager";
import { supabase } from "@/utils/supabase";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MeScreen() {
  const { top } = useSafeAreaInsets();
  const { profile } = useAuthContext();
  const { setIsFirstTime } = useAppDefault();
  const { toast } = useToast();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");

  // Sync profile data to form
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setUsername(profile.username || "");
      setWebsite(profile.website || "");
    }
  }, [profile]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset form to original values
    if (profile) {
      setFullName(profile.full_name || "");
      setUsername(profile.username || "");
      setWebsite(profile.website || "");
    }
    setIsEditing(false);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateProfile({
        full_name: fullName || null,
        username: username || null,
        website: website || null,
      });
      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "success",
      });
      setIsEditing(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile";
      toast({
        title: "Error",
        description: message,
        variant: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            // Clear notification token from database first
            await removeDeviceToken();

            // Sign out from Supabase
            await supabase.auth.signOut();

            // In dev mode, reset the first time signal
            if (__DEV__) {
              setIsFirstTime(true);
            }
          } catch (error) {
            console.error("Logout error:", error);
            // Still try to sign out even if token removal fails
            try {
              await supabase.auth.signOut();
            } catch (signOutError) {
              const message =
                signOutError instanceof Error
                  ? signOutError.message
                  : "Failed to logout";
              toast({
                title: "Error",
                description: message,
                variant: "error",
              });
            }
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <View style={styles.header}>
        <Text variant="title">Profile</Text>
        {!isEditing && (
          <Button variant="outline" size="sm" onPress={handleEdit}>
            Edit
          </Button>
        )}
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <GroupedInput>
          <GroupedInputItem
            label="Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            editable={isEditing}
          />
          <GroupedInputItem
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            editable={isEditing}
            autoCapitalize="none"
          />
          <GroupedInputItem
            label="Website"
            placeholder="https://example.com"
            value={website}
            onChangeText={setWebsite}
            editable={isEditing}
            autoCapitalize="none"
            keyboardType="url"
          />
        </GroupedInput>

        {isEditing && (
          <View style={styles.editButtons}>
            <Button
              variant="outline"
              onPress={handleCancel}
              disabled={isUpdating}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onPress={handleUpdate}
              disabled={isUpdating}
              style={styles.updateButton}
            >
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          variant="destructive"
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 24,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  updateButton: {
    flex: 1,
  },
  footer: {
    paddingVertical: 16,
  },
});
