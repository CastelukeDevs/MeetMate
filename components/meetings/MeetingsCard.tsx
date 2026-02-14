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
import { formatTime, getTimeAgo } from "@/utils/time";
import { Podcast } from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface MeetingsCardProps {
  data: Meetings;
  onPress: () => void;
}

export const MeetingsCard = ({ data, onPress }: MeetingsCardProps) => {
  const timeAgo = getTimeAgo(data.created_at);
  const date = formatTime(data.created_at, "shortDateTime");

  return (
    <TouchableOpacity onPress={onPress}>
      <Card>
        <CardHeader>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconContainer}>
              <Icon name={Podcast} color="white" size={20} />
            </View>
            <View style={styles.cardTitleContainer}>
              <CardTitle>{data.name}</CardTitle>
              <CardDescription>
                {date} - {timeAgo}
              </CardDescription>
            </View>
          </View>
        </CardHeader>
        <CardContent>
          <View style={styles.cardContentGap}>
            <View style={styles.badgeRow}>
              <Badge variant={data.inProgress ? "outline" : "success"}>
                {data.inProgress ? "Processing" : "Completed"}
              </Badge>
            </View>
            {data.summary && <Text>{data.summary.short}</Text>}
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardHeaderRow: {
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
  cardTitleContainer: {
    flex: 1,
    gap: 8,
  },
  cardContentGap: {
    gap: 8,
  },
  badgeRow: {
    flexDirection: "row",
  },
});
