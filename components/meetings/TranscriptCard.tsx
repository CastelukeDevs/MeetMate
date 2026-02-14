import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { formatDuration } from "@/utils/time";
import { RefreshCw } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

interface TranscriptCardProps {
  segments?: TranscriptSegment[];
  inProgress?: boolean | null;
  onRetry?: () => void;
  retrying?: boolean;
}

export function TranscriptCard({
  segments,
  inProgress,
  onRetry,
  retrying,
}: TranscriptCardProps) {
  const isPending = inProgress === null;
  const isProcessing = inProgress === true;

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
        ) : isPending ? (
          <TouchableOpacity
            style={styles.retryContainer}
            onPress={onRetry}
            disabled={retrying}
          >
            {retrying ? (
              <ActivityIndicator size="small" />
            ) : (
              <Icon name={RefreshCw} size={24} />
            )}
            <Text variant="caption" style={styles.retryText}>
              {retrying ? "Processing..." : "Tap to process transcription"}
            </Text>
          </TouchableOpacity>
        ) : isProcessing ? (
          <View style={styles.skeletonGapLarge}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.segmentGap}>
                <Skeleton width={80} height={12} variant="rounded" />
                <Skeleton width="100%" height={16} variant="rounded" />
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
  retryContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 8,
  },
  retryText: {
    opacity: 0.7,
  },
});
