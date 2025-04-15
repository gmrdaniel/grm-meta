
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NotificationSettingsHeaderProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export const NotificationSettingsHeader = ({ 
  pageSize, 
  onPageSizeChange 
}: NotificationSettingsHeaderProps) => {
  return (
    <div className="flex justify-between items-center px-4 py-3 border-b">
      <h3 className="text-lg font-medium">Notification Settings</h3>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Items per page:</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(parseInt(value))}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="10" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};