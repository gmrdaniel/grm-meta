
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { Users, DollarSign, ShoppingCart } from "lucide-react";

const CreatorDashboard = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Creator Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              <StatsCard
                title="Your Followers"
                value="1,234"
                description="Total followers"
                icon={<Users size={20} />}
                trend="up"
                trendValue="+2.25%"
              />
              <StatsCard
                title="Your Earnings"
                value="$5,432"
                description="This month"
                icon={<DollarSign size={20} />}
                trend="up"
                trendValue="+7.5%"
              />
              <StatsCard
                title="Content Views"
                value="10,789"
                description="This month"
                icon={<ShoppingCart size={20} />}
                trend="up"
                trendValue="+4.1%"
              />
            </div>

            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 animate-fadeIn">
              <h2 className="text-lg font-semibold mb-6">Your Recent Activity</h2>
              <div className="space-y-4">
                {/* Creator-specific activity feed */}
                <div className="p-4 border rounded-lg">
                  <p className="font-medium">New Follower</p>
                  <p className="text-sm text-gray-500">2 minutes ago</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-medium">Content Milestone Reached</p>
                  <p className="text-sm text-gray-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreatorDashboard;
