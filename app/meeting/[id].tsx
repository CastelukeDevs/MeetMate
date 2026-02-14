import { MeetingHeader } from "@/components/meetings/MeetingHeader";
import { SummaryCard } from "@/components/meetings/SummaryCard";
import { TranscriptCard } from "@/components/meetings/TranscriptCard";
import { AudioPlayer } from "@/components/ui/audio-player";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { Meetings } from "@/types/meeting.types";
import { getMeetingById } from "@/utils/meetingManager";
import { processMeetingById } from "@/utils/processTranscript";
import { getSignedUrl } from "@/utils/uploadAudio";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MeetingScreen() {
  const { top } = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { toast } = useToast();

  const [meetings, setMeetings] = useState<Meetings>();
  const [audioUrl, setAudioUrl] = useState<string>();
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const fetchMeetingDetail = async () => {
      try {
        const meetingDetail = await getMeetingById(id);
        const signedUrl = await getSignedUrl(
          meetingDetail.recording,
          "meetings_bucket",
        );

        setMeetings(meetingDetail);
        setAudioUrl(signedUrl);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load meeting details";
        toast({
          title: "Error",
          description: message,
          variant: "error",
        });
      }
    };

    fetchMeetingDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRetry = async () => {
    if (!id || retrying) return;

    setRetrying(true);
    try {
      await processMeetingById(id);
      // Update local state to show processing
      setMeetings((prev) => (prev ? { ...prev, inProgress: true } : prev));
      toast({
        title: "Processing Started",
        description: "Your meeting is being transcribed",
        variant: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to start processing";
      toast({
        title: "Error",
        description: message,
        variant: "error",
      });
    } finally {
      setRetrying(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: top }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.backHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Icon name={ChevronLeft} size={24} />
          <Text variant="body">Back</Text>
        </TouchableOpacity>
      </View>

      <AudioPlayer
        source={{ uri: audioUrl }}
        showControls={true}
        showWaveform={true}
        showTimer={true}
        showProgressBar={true}
        autoPlay={false}
      />

      <MeetingHeader name={meetings?.name} createdAt={meetings?.created_at} />

      <SummaryCard
        summary={meetings?.summary?.text}
        inProgress={meetings?.inProgress}
        onRetry={handleRetry}
        retrying={retrying}
      />

      <TranscriptCard
        segments={meetings?.annotation}
        inProgress={meetings?.inProgress}
        onRetry={handleRetry}
        retrying={retrying}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  backHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
