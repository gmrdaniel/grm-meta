
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { StatsCard } from "@/components/StatsCard";
import { NotificationsCard } from "@/components/creator/NotificationsCard";
import { PendingServicesDialog } from "@/components/creator/PendingServicesDialog";
import { Image, Star, Heart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function CreatorDashboard() {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className={cn(
          "flex-1 overflow-y-auto p-6",
          isMobile && "pb-20" // Add padding at the bottom for mobile navigation
        )}>
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-semibold text-gray-800">Creator Dashboard</h1>
            
            <NotificationsCard />
            
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
      <PendingServicesDialog />
    </div>
  );
}
