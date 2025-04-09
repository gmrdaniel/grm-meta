
interface NotificationSettingsSummaryProps {
  currentCount: number;
  totalCount: number;
}

export const NotificationSettingsSummary = ({
  currentCount,
  totalCount
}: NotificationSettingsSummaryProps) => {
  return (
    <div className="text-sm text-gray-500 text-right">
      Showing {Math.min(currentCount, totalCount)} of {totalCount} settings
    </div>
  );
};
