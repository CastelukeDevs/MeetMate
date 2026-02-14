import { AudioPlayer } from "@/components/ui/audio-player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { Meetings } from "@/types/meeting.types";
import { getMeetingById } from "@/utils/meetingManager";
import { formatTime, getTimeAgo } from "@/utils/time";
import { getSignedUrl } from "@/utils/uploadAudio";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Podcast } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MeetingScreen() {
  const { top } = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { toast } = useToast();

  const [meetings, setMeetings] = useState<Meetings>();
  const [audioUrl, setAudioUrl] = useState<string>();

  const timeAgo = useMemo(
    () => (!meetings ? "" : getTimeAgo(meetings.created_at)),
    [meetings],
  );

  const date = useMemo(() => {
    if (!meetings) return "";
    const date = formatTime(meetings.created_at, "shortDateTime");
    return date;
  }, [meetings]);

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
  }, [id, toast]);

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

      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <Icon name={Podcast} color="white" size={20} />
        </View>
        <View style={styles.titleContainer}>
          <Text variant="title" numberOfLines={1}>
            {meetings?.name}
          </Text>
          <Text variant="caption">
            {date} - {timeAgo}
          </Text>
        </View>
      </View>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {meetings?.summary?.text ? (
            <Text>{meetings.summary.text}</Text>
          ) : (
            <View style={styles.skeletonGap}>
              <Skeleton width="100%" height={16} variant="rounded" />
              <Skeleton width="100%" height={16} variant="rounded" />
              <Skeleton width="80%" height={16} variant="rounded" />
            </View>
          )}
        </CardContent>
      </Card>

      {/* Transcript Card */}
      <Card>
        <CardHeader>
          <CardTitle>Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          {meetings?.annotation && meetings.annotation.length > 0 ? (
            <View style={styles.skeletonGap}>
              {meetings.annotation.map((segment, index) => (
                <View key={index} style={styles.segmentGap}>
                  <Text variant="caption" style={styles.timestampText}>
                    {formatTime(segment.start)} - {formatTime(segment.end)}
                  </Text>
                  <Text>{segment.text}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.skeletonGapLarge}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.segmentGap}>
                  <Skeleton width={80} height={12} variant="rounded" />
                  <Skeleton width="100%" height={16} variant="rounded" />
                </View>
              ))}
            </View>
          )}
        </CardContent>
      </Card>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    gap: 8,
  },
  skeletonGap: {
    gap: 8,
  },
  skeletonGapLarge: {
    gap: 12,
  },
  segmentGap: {
    gap: 4,
  },
  timestampText: {
    opacity: 0.6,
  },
});
