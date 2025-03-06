
import { Bell, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth"; // Updated import path
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Notification {
  id: string;
  type: string;
  message: string;
  status: string;
  created_at: string;
}

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => n.status === "unread").length || 0);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ status: "read" })
        .eq("id", notificationId);

      if (error) throw error;
      
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, status: "read" }
          : notification
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      toast.error("Error updating notification");
      console.error("Error:", error.message);
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/auth");
    }
  };

  if (!user) {
    return (
      <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-medium text-gray-800">Dashboard</h1>
          </div>
          <Button 
            onClick={() => navigate("/auth")}
            className="bg-gray-900 text-white hover:bg-gray-800 rounded-xl"
          >
            Login
          </Button>
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 
            onClick={() => navigate("/creator/dashboard")}
            className="text-xl font-medium text-gray-800 cursor-pointer hover:text-gray-600 transition-colors"
          >
            Dashboard
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-2 hover:bg-gray-100/50 rounded-xl transition-colors relative">
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                <h3 className="font-medium text-gray-900">Notifications</h3>
                {notifications.length === 0 ? (
                  <p className="text-gray-500">No notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => {
                        if (notification.status === "unread") {
                          markAsRead(notification.id);
                        }
                      }}
                      className={`p-3 rounded-lg border cursor-pointer ${
                        notification.status === "unread"
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium capitalize text-sm">
                          {notification.type.replace("_", " ")}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{notification.message}</p>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
          
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 p-2 hover:bg-gray-100/50 rounded-xl transition-colors">
              <User size={20} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-800">{user.email}</span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hover:bg-red-50 rounded-xl"
            >
              <LogOut className="h-5 w-5 text-red-600" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
