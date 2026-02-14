import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const COLLAPSED_HEIGHT = 130;

interface SummaryCardProps {
  summary?: string;
  inProgress?: boolean | null;
  onRetry?: () => void;
  retrying?: boolean;
}

export function SummaryCard({
  summary,
  inProgress,
  onRetry,
  retrying,
}: SummaryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const contentHeightRef = useRef(0);
  const animatedHeight = useSharedValue(COLLAPSED_HEIGHT);

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    overflow: "hidden",
  }));

  const toggleExpand = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    animatedHeight.value = withTiming(
      newExpanded ? contentHeightRef.current : COLLAPSED_HEIGHT,
      { duration: 300 },
    );
  };

  const isPending = inProgress === null;
  const isProcessing = inProgress === true;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {summary ? (
          <View>
            {/* Hidden view to measure full content height */}
            <View style={styles.hiddenMeasure} pointerEvents="none">
              <Text
                onLayout={(e) => {
                  const height = e.nativeEvent.layout.height;
                  if (height > 0 && contentHeightRef.current === 0) {
                    contentHeightRef.current = height;
                    if (height > COLLAPSED_HEIGHT) {
                      setShowExpandButton(true);
                    }
                  }
                }}
              >
                {summary}
              </Text>
            </View>
            {/* Animated visible content */}
            <Animated.View style={animatedStyle}>
              <Text>{summary}</Text>
            </Animated.View>
            {showExpandButton && (
              <TouchableOpacity
                onPress={toggleExpand}
                style={styles.expandButton}
              >
                <Text variant="caption" style={styles.expandButtonText}>
                  {expanded ? "Show less" : "Show more"}
                </Text>
                <Icon name={expanded ? ChevronUp : ChevronDown} size={16} />
              </TouchableOpacity>
            )}
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
          <View style={styles.skeletonGap}>
            <Skeleton width="100%" height={16} variant="rounded" />
            <Skeleton width="100%" height={16} variant="rounded" />
            <Skeleton width="80%" height={16} variant="rounded" />
          </View>
        ) : (
          <View style={styles.skeletonGap}>
            <Skeleton width="100%" height={16} variant="rounded" />
            <Skeleton width="100%" height={16} variant="rounded" />
            <Skeleton width="80%" height={16} variant="rounded" />
          </View>
        )}
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  hiddenMeasure: {
    position: "absolute",
    opacity: 0,
    zIndex: -1,
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 8,
  },
  expandButtonText: {
    opacity: 0.7,
  },
  skeletonGap: {
    gap: 8,
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
