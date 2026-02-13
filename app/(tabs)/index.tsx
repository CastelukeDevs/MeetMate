import { AudioRecorder } from "@/components/ui/audio-recorder";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import React, { useState } from "react";
import { ActivityIndicator } from "react-native";

function Index() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const simulateCloudUpload = async (uri: string): Promise<string> => {
    return new Promise((resolve) => {
      setUploading(true);
      setUploadProgress(0);

      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setUploading(false);
            resolve(
              `https://cloud-storage.example.com/audio/${Date.now()}.m4a`,
            );
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    });
  };

  const handleRecordingComplete = async (uri: string) => {
    try {
      const cloudUrl = await simulateCloudUpload(uri);

      console.log(`Recording uploaded to cloud storage!\n\nURL: ${cloudUrl}`);

      setUploadProgress(0);
    } catch (error) {
      console.log("Failed to upload recording to cloud storage.");

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
