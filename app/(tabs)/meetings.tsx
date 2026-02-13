import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Meetings } from "@/types/meeting.types";
import { getMeetings } from "@/utils/meetingManager";
import { getTimeAgo } from "@/utils/time";
import { router } from "expo-router";
import { Podcast } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MeetingsScreen = () => {
  const { top, bottom } = useSafeAreaInsets();
  const [meetingList, setMeetingList] = useState<Meetings[]>([]);

  const goToMeetingsDetail = (id: string) => {
    router.push(`/meeting/${id}`);
  };

  const fetchMeetingList = async () => {
    try {
      const meetings = await getMeetings();
      if (meetings) {
        setMeetingList(meetings);
        console.log("current meetings", meetings);
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchMeetingList();
    return () => {};
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", paddingTop: top }}>
      <FlatList
        data={meetingList}
        keyExtractor={(data) => data.id}
        renderItem={({ item }) => (
          <MeetingsCard
            data={item}
            onPress={() => goToMeetingsDetail(item.id)}
          />
        )}
        contentContainerStyle={{
          gap: 12,
          marginBottom: bottom,
          paddingHorizontal: 8,
        }}
      />
      {/* <MeetingsCard data={meetingsData} /> */}
    </View>
  );
};

export default MeetingsScreen;

const MeetingsCard = ({
  data,
  onPress,
}: {
  data: Meetings;
  onPress: () => void;
}) => {
  const timeAgo = getTimeAgo(data.created_at);

  return (
    <TouchableOpacity onPress={onPress}>
      <Card>
        <CardHeader>
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
              <CardTitle>{data.name}</CardTitle>
              <CardDescription>{timeAgo}</CardDescription>
            </View>
          </View>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row" }}>
              <Badge variant={data.inProgress ? "outline" : "success"}>
                {data.inProgress ? "Processing" : "Completed"}
              </Badge>
            </View>
            {data.summary && (
              <Text>
                You have a new message from John Doe. Click to view the full
                conversation and respond.
              </Text>
            )}
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({});
