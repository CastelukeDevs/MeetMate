import { AudioRecorder } from "@/components/ui/audio-recorder";
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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleRecordingComplete = async (uri: string) => {
    try {
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
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <View style={{ width: "100%" }}>
        <AudioRecorder
          quality="high"
          showWaveform={true}
          showTimer={true}
          maxDuration={1 * 60 * 60} // 1 hour
          // onRecordingComplete={handleRecordingComplete}
          onSaveRecording={handleRecordingComplete}
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
    </View>
  );
}

export default Index;
