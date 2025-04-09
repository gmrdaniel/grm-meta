
interface NotificationLogsSummaryProps {
  currentCount: number;
  totalCount: number;
}

export function NotificationLogsSummary({
  currentCount,
  totalCount
}: NotificationLogsSummaryProps) {
  return (
    <div className="text-sm text-gray-500 text-right">
      Showing {Math.min(currentCount, totalCount)} of {totalCount} logs
    </div>
  );
}
