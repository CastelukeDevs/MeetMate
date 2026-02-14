import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { formatDuration } from "@/utils/time";
import React from "react";
import { StyleSheet, View } from "react-native";

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

interface TranscriptCardProps {
  segments?: TranscriptSegment[];
}

export function TranscriptCard({ segments }: TranscriptCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transcript</CardTitle>
      </CardHeader>
      <CardContent>
        {segments && segments.length > 0 ? (
          <View style={styles.segmentsContainer}>
            {segments.map((segment, index) => (
              <View key={index} style={styles.segmentGap}>
                <Text variant="caption" style={styles.timestampText}>
                  {formatDuration(segment.start)} -{" "}
                  {formatDuration(segment.end)}
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
  );
}

const styles = StyleSheet.create({
  segmentsContainer: {
    gap: 8,
  },
  segmentGap: {
    gap: 4,
  },
  timestampText: {
    opacity: 0.6,
  },
  skeletonGapLarge: {
    gap: 12,
  },
});
