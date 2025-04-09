
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotificationSettingsFiltersProps {
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  channelFilter: string;
  setChannelFilter: (channel: string) => void;
  onCreateClick: () => void;
}

export const NotificationSettingsFilters: React.FC<NotificationSettingsFiltersProps> = ({
  typeFilter,
  setTypeFilter,
  channelFilter,
  setChannelFilter,
  onCreateClick,
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Type</label>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="reminder">Reminder</SelectItem>
            <SelectItem value="notification">Notification</SelectItem>
            <SelectItem value="alert">Alert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Channel</label>
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Channels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Channels</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1"></div>

      <div className="flex items-end">
        <Button onClick={onCreateClick}>
          Create Notification Setting
        </Button>
      </div>
    </div>
  );
};
