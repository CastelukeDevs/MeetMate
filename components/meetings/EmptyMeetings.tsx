import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Inbox } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

export const EmptyMeetings = () => {
  return (
    <Card>
      <CardContent>
        <View style={styles.emptyContainer}>
          <Icon name={Inbox} size={48} style={styles.emptyIcon} />
          <Text variant="body" style={styles.emptyText}>
            Meetings is empty
          </Text>
        </View>
      </CardContent>
    </Card>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 12,
  },
  emptyIcon: {
    opacity: 0.5,
  },
  emptyText: {
    opacity: 0.6,
  },
});
