import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: string;
  message: string;
  status: string;
  created_at: string;
}

export function NotificationsCard() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  async function fetchNotifications() {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("profile_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      toast.error("Error fetching notifications");
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ status: "read" })
        .eq("id", notificationId);

      if (error) throw error;
      
      // Actualizar el estado local
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, status: "read" }
          : notification
      ));
    } catch (error: any) {
      toast.error("Error updating notification");
      console.error("Error:", error.message);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading notifications...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.status === "unread"
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-gray-200"
                }`}
                onClick={() => {
                  if (notification.status === "unread") {
                    markAsRead(notification.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium capitalize">
                    {notification.type.replace("_", " ")}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{notification.message}</p>
                {notification.status === "unread" && (
                  <div className="mt-2 text-sm text-blue-600">
                    Click to mark as read
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
