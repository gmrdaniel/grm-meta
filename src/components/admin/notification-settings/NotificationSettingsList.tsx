
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { LoadingSpinner } from "@/components/auth/LoadingSpinner";
import { EmptyStateCard } from "./components/EmptyStateCard";
import { NotificationSettingsHeader } from "./components/NotificationSettingsHeader";
import { NotificationSettingsTable } from "./components/NotificationSettingsTable";
import { NotificationSettingsPagination } from "./components/NotificationSettingsPagination";
import { NotificationSettingsSummary } from "./components/NotificationSettingsSummary";
import { useNotificationSettings } from "./hooks/useNotificationSettings";
import { toggleNotificationStatus, deleteNotificationSetting } from "./services/notificationSettingsService";
import { NotificationSetting } from "./types";
import { EditNotificationSettings } from "./EditNotificationSettings";

export function NotificationSettingsList() {
  const {
    settings,
    isLoading,
    error,
    refetch,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    totalSettings,
    totalPages
  } = useNotificationSettings();

  const [editingSetting, setEditingSetting] = useState<NotificationSetting | null>(null);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const success = await toggleNotificationStatus(id, currentStatus);
    if (success) refetch();
  };

  const handleDeleteSetting = async (id: string) => {
    const success = await deleteNotificationSetting(id);
    if (success) refetch();
  };

  const handleEditSetting = (setting: NotificationSetting) => {
    setEditingSetting(setting);
  };

  const handleEditSuccess = () => {
    setEditingSetting(null);
    refetch();
  };

  const handleCancelEdit = () => {
    setEditingSetting(null);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md flex items-center gap-2 text-red-600">
        <AlertTriangle className="h-5 w-5" />
        <span>Error loading notification settings: {error.message}</span>
      </div>
    );
  }

  if (editingSetting) {
    return (
      <EditNotificationSettings 
        setting={editingSetting} 
        onSuccess={handleEditSuccess}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <NotificationSettingsHeader 
          pageSize={pageSize} 
          onPageSizeChange={setPageSize} 
        />

        {settings && settings.length === 0 ? (
          <EmptyStateCard />
        ) : (
          <NotificationSettingsTable 
            settings={settings} 
            onToggleStatus={handleToggleStatus}
            onDeleteSetting={handleDeleteSetting}
            onEditSetting={handleEditSetting}
          />
        )}
      </div>

      <NotificationSettingsPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      
      <NotificationSettingsSummary 
        currentCount={settings?.length || 0}
        totalCount={totalSettings}
      />
    </div>
  );
}
