
interface NotificationLogsSummaryProps {
  currentCount: number;
  totalCount: number;
  filteredCount: number;
}

export function NotificationLogsSummary({
  currentCount,
  totalCount,
  filteredCount
}: NotificationLogsSummaryProps) {
  return (
    <div className="text-sm text-gray-500 text-right">
      Showing {Math.min(currentCount, filteredCount)} of {filteredCount} filtered logs
      {filteredCount < totalCount && ` (${totalCount} total)`}
    </div>
  );
}
