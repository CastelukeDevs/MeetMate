import { Profile, ProfileUpdate } from "@/types/profile.types";
import { supabase } from "./supabase";

/**
 * Get the current user's profile
 * @throws Error if user not authenticated or profile not found
 */
export async function getProfile(): Promise<Profile> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return data as Profile;
}

/**
 * Get a profile by user ID
 * @param userId - The user ID to fetch profile for
 * @throws Error if profile not found
 */
export async function getProfileById(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return data as Profile;
}

/**
 * Update the current user's profile
 * @param updates - Partial profile fields to update
 * @throws Error if user not authenticated or update fails
 */
export async function updateProfile(updates: ProfileUpdate): Promise<Profile> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return data as Profile;
}

/**
 * Update the device token for push notifications
 * @param deviceToken - The device token to save
 * @throws Error if user not authenticated or update fails
 */
export async function updateDeviceToken(deviceToken: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      device_token: deviceToken,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    throw new Error(`Failed to update device token: ${error.message}`);
  }
}

/**
 * Remove the device token (e.g., on logout)
 * @throws Error if user not authenticated or update fails
 */
export async function removeDeviceToken(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      device_token: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    throw new Error(`Failed to remove device token: ${error.message}`);
  }
}
