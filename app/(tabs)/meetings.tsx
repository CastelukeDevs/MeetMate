import { EmptyMeetings } from "@/components/meetings/EmptyMeetings";
import { MeetingsCard } from "@/components/meetings/MeetingsCard";
import { useToast } from "@/components/ui/toast";
import { Meetings } from "@/types/meeting.types";
import { getMeetings } from "@/utils/meetingManager";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MeetingsScreen = () => {
  const { top, bottom } = useSafeAreaInsets();
  const { toast } = useToast();

  const [meetingList, setMeetingList] = useState<Meetings[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const goToMeetingsDetail = (id: string) => {
    router.push(`/meeting/${id}`);
  };

  const fetchMeetingList = useCallback(async () => {
    try {
      const meetings = await getMeetings();
      if (meetings) {
        setMeetingList(meetings);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch meetings";
      toast({
        title: "Error",
        description: message,
        variant: "error",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchMeetingList();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMeetingList();
  }, [fetchMeetingList]);

  useFocusEffect(
    useCallback(() => {
      fetchMeetingList();
    }, [fetchMeetingList]),
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={meetingList}
        keyExtractor={(data) => data.id}
        renderItem={({ item }) => (
          <MeetingsCard
            data={item}
            onPress={() => goToMeetingsDetail(item.id)}
          />
        )}
        ListEmptyComponent={<EmptyMeetings />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={top}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          { marginBottom: bottom, paddingTop: top },
        ]}
      />
    </View>
  );
};

export default MeetingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  listContent: {
    gap: 12,
    paddingHorizontal: 8,
  },
});
