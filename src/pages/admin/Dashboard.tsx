
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { Users, DollarSign, ShoppingCart } from "lucide-react";

const AdminDashboard = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              <StatsCard
                title="Total Users"
                value="12,345"
                description="All registered users"
                icon={<Users size={20} />}
                trend="up"
                trendValue="+5.25%"
              />
              <StatsCard
                title="Revenue"
                value="$54,321"
                description="Total platform revenue"
                icon={<DollarSign size={20} />}
                trend="up"
                trendValue="+12.5%"
              />
              <StatsCard
                title="Creators"
                value="789"
                description="Active creators"
                icon={<ShoppingCart size={20} />}
                trend="up"
                trendValue="+8.1%"
              />
            </div>

            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 animate-fadeIn">
              <h2 className="text-lg font-semibold mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {/* Admin-specific activity feed */}
                <div className="p-4 border rounded-lg">
                  <p className="font-medium">New Creator Registration</p>
                  <p className="text-sm text-gray-500">2 minutes ago</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-medium">Revenue Milestone Reached</p>
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

export default AdminDashboard;
