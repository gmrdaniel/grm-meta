
import { Bell, User, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
          <h1 className="text-xl font-medium text-gray-800">Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100/50 rounded-xl transition-colors relative">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          
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
