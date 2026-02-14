import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { formatTime, getTimeAgo } from "@/utils/time";
import { Podcast } from "lucide-react-native";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

interface MeetingHeaderProps {
  name?: string;
  createdAt?: string;
}

export function MeetingHeader({ name, createdAt }: MeetingHeaderProps) {
  const date = useMemo(() => {
    if (!createdAt) return "";
    return formatTime(createdAt, "shortDateTime");
  }, [createdAt]);

  const timeAgo = useMemo(() => {
    if (!createdAt) return "";
    return getTimeAgo(createdAt);
  }, [createdAt]);

  return (
    <View style={styles.headerRow}>
      <View style={styles.iconContainer}>
        <Icon name={Podcast} color="white" size={20} />
      </View>
      <View style={styles.titleContainer}>
        <Text variant="title" numberOfLines={1}>
          {name}
        </Text>
        <Text variant="caption">
          {date} - {timeAgo}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
