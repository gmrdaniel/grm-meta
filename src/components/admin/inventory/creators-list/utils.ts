
// Utility functions for CreatorsList
import { format } from "date-fns";

export const formatFollowers = (count?: number) => {
  if (count === undefined || count === null) return "N/A";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

export const formatEngagement = (rate?: number) => {
  if (rate === undefined || rate === null) return "N/A";
  return `${rate.toFixed(2)}%`;
};

export const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch (e) {
    return "N/A";
  }
};
