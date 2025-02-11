
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { StatsCard } from "@/components/StatsCard";
import { Image, Star, Heart } from "lucide-react";

export default function CreatorDashboard() {
  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Creator Dashboard</h1>
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
