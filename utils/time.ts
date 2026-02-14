import { format, formatDistanceToNow } from "date-fns";

export type TimeFormat =
  | "short" // "Jan 15"
  | "long" // "January 15, 2026"
  | "full" // "Thursday, January 15, 2026"
  | "time" // "2:30 PM"
  | "time24" // "14:30"
  | "date" // "01/15/2026"
  | "dateTime" // "Jan 15, 2026, 2:30 PM"
  | "dateTimeFull" // "January 15, 2026 at 2:30 PM"
  | "shortDateTime" // "15/01/2026 14:30"
  | "iso"; // "2026-01-15"

const formatPatterns: Record<TimeFormat, string> = {
  short: "MMM d",
  long: "MMMM d, yyyy",
  full: "EEEE, MMMM d, yyyy",
  time: "h:mm a",
  time24: "HH:mm",
  date: "MM/dd/yyyy",
  dateTime: "MMM d, yyyy, h:mm a",
  dateTimeFull: "MMMM d, yyyy 'at' h:mm a",
  shortDateTime: "dd MMM yyyy HH:mm",
  iso: "yyyy-MM-dd",
};

export const formatTime = (
  dateInput: string | Date | number,
  formatName: TimeFormat = "short",
): string => {
  const date =
    typeof dateInput === "string" || typeof dateInput === "number"
      ? new Date(dateInput)
      : dateInput;

  return format(date, formatPatterns[formatName]);
};

export const getTimeAgo = (dateString: string) => {
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
  });
};

/**
 * Format seconds into a duration string (mm:ss or hh:mm:ss)
 * @param seconds - Number of seconds
 * @param showHours - Always show hours even if < 1 hour
 */
export const formatDuration = (
  seconds: number,
  showHours: boolean = false,
): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0 || showHours) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
