import { supabase } from "@/utils/supabase";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:8000";

export interface ProcessMeetingResponse {
  success: boolean;
  message: string;
}

/**
 * Trigger the backend to process a meeting's audio and generate transcription
 * Backend processes in background and sends push notification when done
 * @param meetingId - The ID of the meeting to process
 * @param audioUrl - The URL of the audio file to transcribe
 * @returns ProcessMeetingResponse with success/fail status
 */
export async function processMeetingTranscript(
  meetingId: string,
  audioUrl: string,
): Promise<ProcessMeetingResponse> {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session) {
    return {
      success: false,
      message: "User not authenticated",
    };
  }

  const session = sessionData.session;

  try {
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
      console.log("Server error details:", errorBody);
      return {
        success: false,
        message: `Server error: ${response.status} - ${errorBody}`,
      };
    }

    const data: ProcessMeetingResponse = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Process a meeting by its ID (fetches audio URL from meeting data)
 * @param meetingId - The ID of the meeting to process
 * @returns ProcessMeetingResponse with success/fail status
 */
export async function processMeetingById(
  meetingId: string,
): Promise<ProcessMeetingResponse> {
  const { data: meeting, error } = await supabase
    .from("meetings")
    .select("recording")
    .eq("id", meetingId)
    .single();

  if (error || !meeting) {
    return {
      success: false,
      message: `Meeting not found: ${meetingId}`,
    };
  }

  if (!meeting.recording) {
    return {
      success: false,
      message: "Meeting has no recording",
    };
  }

  return processMeetingTranscript(meetingId, meeting.recording);
}
