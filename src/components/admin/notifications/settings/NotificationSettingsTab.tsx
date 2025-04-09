
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { NotificationSettingsTable } from "./NotificationSettingsTable";
import { NotificationSettingsFilters } from "./NotificationSettingsFilters";
import { NotificationSettingForm } from "./NotificationSettingForm";
import { 
  fetchNotificationSettings, 
  createNotificationSetting,
  updateNotificationSetting,
  deleteNotificationSetting
} from "@/services/notificationService";
import { NotificationSetting } from "@/types/notification";
import { toast } from "sonner";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const NotificationSettingsTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [typeFilter, setTypeFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<NotificationSetting | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["notificationSettings", page, pageSize, typeFilter, channelFilter],
    queryFn: () => fetchNotificationSettings(page, pageSize, { 
      type: typeFilter || undefined, 
      channel: channelFilter || undefined 
    }),
  });

  const handleCreateClick = () => {
    setSelectedSetting(undefined);
    setFormOpen(true);
  };

  const handleEditClick = (setting: NotificationSetting) => {
    setSelectedSetting(setting);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setSettingToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!settingToDelete) return;
    
    try {
      await deleteNotificationSetting(settingToDelete);
      toast.success("Notification setting deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting notification setting:", error);
      toast.error("Failed to delete notification setting");
    }
    
    setDeleteDialogOpen(false);
    setSettingToDelete(null);
  };

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    try {
      await updateNotificationSetting(id, { enabled });
      toast.success(`Notification setting ${enabled ? 'enabled' : 'disabled'} successfully`);
      refetch();
    } catch (error) {
      console.error("Error updating notification setting:", error);
      toast.error("Failed to update notification setting");
    }
  };

  const handleFormSubmit = async (formData: Omit<NotificationSetting, 'id' | 'created_at'>) => {
    try {
      if (selectedSetting) {
        await updateNotificationSetting(selectedSetting.id, formData);
        toast.success("Notification setting updated successfully");
      } else {
        await createNotificationSetting(formData);
        toast.success("Notification setting created successfully");
      }
      refetch();
    } catch (error) {
      console.error("Error saving notification setting:", error);
      toast.error("Failed to save notification setting");
      throw error;
    }
  };

  if (error) {
    return <div>Error loading notification settings: {(error as Error).message}</div>;
  }

  const totalPages = data ? Math.ceil(data.count / pageSize) : 0;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <NotificationSettingsFilters
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          channelFilter={channelFilter}
          setChannelFilter={setChannelFilter}
          onCreateClick={handleCreateClick}
        />

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : (
          <>
            <NotificationSettingsTable
              settings={data?.data || []}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onToggleEnabled={handleToggleEnabled}
            />

            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      aria-disabled={page === 1}
                      className={page === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        onClick={() => setPage(p)}
                        isActive={page === p}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      aria-disabled={page === totalPages}
                      className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </Card>

      <NotificationSettingForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        initialData={selectedSetting}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              notification setting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
