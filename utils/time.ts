import { formatDistanceToNow } from "date-fns";

export const getTimeAgo = (dateString: string) => {
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
  });
};
