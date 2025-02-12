
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { StatsCard } from "@/components/StatsCard";
import { NotificationsCard } from "@/components/creator/NotificationsCard";
import { PersonalInfoCard } from "@/components/creator/PersonalInfoCard";
import { Button } from "@/components/ui/button";
import { Image, Star, Heart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function CreatorDashboard() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [personalData, setPersonalData] = useState(null);
  const [hasPendingServices, setHasPendingServices] = useState(false);

  useEffect(() => {
    if (user) {
      loadPersonalData();
      checkPendingServices();
    }
  }, [user]);

  async function loadPersonalData() {
    try {
      const { data, error } = await supabase
        .from("personal_data")
        .select("*")
        .eq("profile_id", user?.id)
        .single();

      if (error) throw error;
      setPersonalData(data);
    } catch (error: any) {
      console.error("Error loading personal data:", error);
      toast.error("Error loading personal data");
    }
  }

  async function checkPendingServices() {
    try {
      const { count, error } = await supabase
        .from("creator_services")
        .select("*", { count: 'exact', head: true })
        .eq("profile_id", user?.id)
        .eq("terms_accepted", false)
        .eq("status", "pendiente");

      if (error) throw error;
      setHasPendingServices(count ? count > 0 : false);
    } catch (error: any) {
      console.error("Error checking pending services:", error);
    }
  }

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className={cn(
          "flex-1 overflow-y-auto p-6",
          isMobile && "pb-20"
        )}>
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-800">Creator Dashboard</h1>
              {hasPendingServices && (
                <Button 
                  onClick={() => navigate("/creator/pending-services")}
                  variant="outline"
                >
                  View Pending Services
                </Button>
              )}
            </div>
            
            <NotificationsCard />
            
            <PersonalInfoCard personalData={personalData} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              <StatsCard
                title="Content Created"
                value="156"
                description="Total pieces created"
                icon={<Image size={20} />}
                trend="up"
                trendValue="+15.5%"
              />
              <StatsCard
                title="Average Rating"
                value="4.8"
                description="From user reviews"
                icon={<Star size={20} />}
                trend="up"
                trendValue="+0.3"
              />
              <StatsCard
                title="Likes"
                value="2,341"
                description="Total content likes"
                icon={<Heart size={20} />}
                trend="up"
                trendValue="+22.4%"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
