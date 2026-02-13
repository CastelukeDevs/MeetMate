import { Meetings } from "@/types/meeting.types";
import { supabase } from "./supabase";

type IMeeting = Partial<Meetings>;
export const createNewMeeting = async (audio_url: string, name: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const newMeeting: IMeeting = {
    users: user?.id,
    inProgress: true,
    name,
    recording: audio_url,
  };

  try {
    const { data, error } = await supabase
      .from("meetings")
      .insert([newMeeting])
      .select()
      .single();

    if (error) {
      console.error("Error creating new meeting:", error.message);
      throw error;
    }

    return data as Meetings;
  } catch (error: any) {
    throw error;
  }
};

export const getMeetings = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("users", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching meetings:", error.message);
    throw error;
  }

  return data as Meetings[];
};

export const getMeetingById = async (id: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", id)
    .eq("users", user.id)
    .single();

  if (error) {
    console.error("Error fetching meeting:", error.message);
    throw error;
  }

  return data as Meetings;
};
