import { AudioRecorder } from "@/components/ui/audio-recorder";
import { BottomSheet, useBottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { View } from "@/components/ui/view";
import { createNewMeeting } from "@/utils/meetingManager";
import { processMeetingTranscript } from "@/utils/processTranscript";
import { formatTime } from "@/utils/time";
import {
  getAudioFileInfo,
  uploadAudioToSupabase,
  type UploadProgress,
} from "@/utils/uploadAudio";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

// Test meeting ID for notification testing
const TEST_MEETING_ID = "25";

function Index() {
  const saveSheet = useBottomSheet();
  const { toast } = useToast();

  const [recordingSession, setRecordingSession] = useState<number>(Date.now());
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [defaultMeetingName, setDefaultMeetingName] = useState("");
  const [recordingUri, setRecordingUri] = useState<string | undefined>();

  const handleRecordingComplete = async () => {
    try {
      const uri = recordingUri;
      if (!uri) {
        console.warn("No recording URI available");
        return;
      }
      saveSheet.close();
      setUploading(true);
      setUploadProgress(0);

      // Get file info
      await getAudioFileInfo(uri);

      // Upload to Supabase with progress tracking
      const result = await uploadAudioToSupabase(
        uri,
        "meetings_bucket", // bucket name
        (progress: UploadProgress) => {
          setUploadProgress(progress.percentage);
        },
      );

      const saveResult = await createNewMeeting(
        result.url,
        defaultMeetingName || `Meeting_${new Date().toISOString()}`,
      );

      await processMeetingTranscript(saveResult.id, saveResult.recording);
      setRecordingSession(Date.now());
      router.push("/(tabs)/meetings");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload recording";
      console.error("Failed to upload recording:", error);
      toast({
        title: "Error",
        description: message,
        variant: "error",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSaveRecording = (uri: string) => {
    saveSheet.open();
    setDefaultMeetingName(
      `Meeting - ${formatTime(new Date().toISOString(), "shortDateTime")}`,
    );
    setRecordingUri(uri);
  };

  const handleSheetClosed = () => {
    saveSheet.close();
  };

  return (
    <View style={styles.container}>
      <View style={styles.recorderWrapper}>
        <AudioRecorder
          sessionId={recordingSession}
          quality="high"
          showWaveform={true}
          showTimer={true}
          maxDuration={1 * 60 * 60} // 1 hour
          onSaveRecording={handleSaveRecording}
        />

        {uploading && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" />
            <Text variant="caption" style={styles.uploadingText}>
              Uploading... {uploadProgress}%
            </Text>
          </View>
        )}
      </View>

      <BottomSheet
        isVisible={saveSheet.isVisible}
        onClose={handleSheetClosed}
        title="Save your meeting recording"
      >
        <View style={styles.sheetContent}>
          <Input
            label="Meeting Name"
            placeholder="Enter meeting name"
            value={defaultMeetingName}
            onChangeText={setDefaultMeetingName}
            variant="outline"
          />
          <Button variant="success" onPress={handleRecordingComplete}>
            Save
          </Button>
        </View>
      </BottomSheet>
    </View>
  );
}

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  recorderWrapper: {
    width: "100%",
    paddingHorizontal: 16,
  },
  uploadingContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  uploadingText: {
    marginTop: 8,
  },
  sheetContent: {
    gap: 8,
  },
  testButtonContainer: {
    position: "absolute",
    bottom: 100,
    right: 16,
  },
});
