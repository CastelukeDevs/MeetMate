import { AudioRecorder } from "@/components/ui/audio-recorder";
import { BottomSheet, useBottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import {
  getAudioFileInfo,
  uploadAudioToSupabase,
  type UploadProgress,
} from "@/utils/uploadAudio";
import React, { useState } from "react";
import { ActivityIndicator } from "react-native";

function Index() {
  const saveSheet = useBottomSheet();

  const [recordingSession, setRecordingSession] = useState<number>(Date.now());
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [defaultFileName, setDefaultFileName] = useState("");
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

      // Get file info for logging
      const fileInfo = await getAudioFileInfo(uri);
      console.log("📁 Recording file info:");
      console.log(`  Filename: ${fileInfo.filename}`);
      console.log(`  Type: ${fileInfo.filetype}`);
      console.log(`  Size: ${fileInfo.sizeFormatted} (${fileInfo.size} bytes)`);

      // Upload to Supabase with progress tracking
      const result = await uploadAudioToSupabase(
        uri,
        "meetings_bucket", // bucket name
        (progress: UploadProgress) => {
          setUploadProgress(progress.percentage);
        },
      );

      if (result.success) {
        console.log(`✅ Recording uploaded!\n📍 URL: ${result.url}`);
      } else {
        console.error(`❌ Upload failed: ${result.error}`);
      }

      setUploading(false);
      setUploadProgress(0);
    } catch (error) {
      console.error("Failed to upload recording:", error);
      setUploading(false);
      setUploadProgress(0);
    } finally {
      setRecordingSession(Date.now());
    }
  };

  const handleSaveRecording = (uri: string) => {
    saveSheet.open();
    setDefaultFileName(`Recording_${new Date().toISOString()}`);
    setRecordingUri(uri);
  };

  const handleSheetClosed = () => {
    saveSheet.close();
  };

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <View style={{ width: "100%" }}>
        <AudioRecorder
          sessionId={recordingSession}
          quality="high"
          showWaveform={true}
          showTimer={true}
          maxDuration={1 * 60 * 60} // 1 hour
          // onRecordingComplete={handleRecordingComplete}
          // onSaveRecording={handleRecordingComplete}

          onSaveRecording={handleSaveRecording}
        />

        {uploading && (
          <View style={{ marginTop: 16, alignItems: "center" }}>
            <ActivityIndicator size="small" />
            <Text variant="caption" style={{ marginTop: 8 }}>
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
        <View style={{ gap: 8 }}>
          <Input
            label="Filename"
            placeholder="Enter recording name"
            value={defaultFileName}
            onChangeText={setDefaultFileName}
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
