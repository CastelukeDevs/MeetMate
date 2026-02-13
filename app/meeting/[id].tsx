import { AudioPlayer } from "@/components/ui/audio-player";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Meetings } from "@/types/meeting.types";
import { getMeetingById } from "@/utils/meetingManager";
import { getTimeAgo } from "@/utils/time";
import { getSignedUrl } from "@/utils/uploadAudio";
import { useLocalSearchParams } from "expo-router";
import { Podcast } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MeetingScreen() {
  const { top } = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [meetings, setMeetings] = useState<Meetings>();
  const [audioUrl, setAudioUrl] = useState<string>();

  const timeAgo = useMemo(
    () => (!meetings ? "" : getTimeAgo(meetings.created_at)),
    [meetings],
  );

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
        // Handle error silently
      }
    };

    fetchMeetingDetail();
  }, [id]);

  return (
    <View style={{ flex: 1, paddingTop: top, paddingHorizontal: 16, gap: 8 }}>
      <AudioPlayer
        source={{ uri: audioUrl }}
        showControls={true}
        showWaveform={true}
        showTimer={true}
        showProgressBar={true}
        autoPlay={false}
        // onPlaybackStatusUpdate={(status) => {
        //   console.log("Playback status:", status);
        // }}
      />

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#3b82f6",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={Podcast} color="white" size={20} />
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          <Text variant="title" numberOfLines={1}>
            {meetings?.name}
          </Text>
          <Text variant="caption">{timeAgo}</Text>
        </View>
      </View>
    </View>
  );
}
