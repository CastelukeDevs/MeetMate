import { supabase } from "@/utils/supabase";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:8000";

/**
 * Trigger the backend to process a meeting's audio and generate transcription
 * Backend processes in background and sends push notification when done
 * @param meetingId - The ID of the meeting to process
 * @param audioUrl - The URL of the audio file to transcribe
 * @throws Error if authentication fails or server returns error
 */
export async function processMeetingTranscript(
  meetingId: string,
  audioUrl: string,
): Promise<void> {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session) {
    throw new Error("User not authenticated");
  }

  const session = sessionData.session;

  const response = await fetch(`${BACKEND_URL}/process-meeting`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      meeting_id: String(meetingId),
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Server error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Processing failed");
  }
}

/**
 * Process a meeting by its ID (fetches audio URL from meeting data)
 * @param meetingId - The ID of the meeting to process
 * @throws Error if meeting not found or has no recording
 */
export async function processMeetingById(meetingId: string): Promise<void> {
  const { data: meeting, error } = await supabase
    .from("meetings")
    .select("recording")
    .eq("id", meetingId)
    .single();

  if (error || !meeting) {
    throw new Error(`Meeting not found: ${meetingId}`);
  }

  if (!meeting.recording) {
    throw new Error("Meeting has no recording");
  }

  await processMeetingTranscript(meetingId, meeting.recording);
}
