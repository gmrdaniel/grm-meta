
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { Users, DollarSign, ShoppingCart, ArrowUpRight } from "lucide-react";

const Index = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              <StatsCard
                title="Total Users"
                value="12,345"
                description="Active users this month"
                icon={<Users size={20} />}
                trend="up"
                trendValue="+5.25%"
              />
              <StatsCard
                title="Revenue"
                value="$54,321"
                description="Total revenue this month"
                icon={<DollarSign size={20} />}
                trend="up"
                trendValue="+12.5%"
              />
              <StatsCard
                title="Orders"
                value="789"
                description="Orders this month"
                icon={<ShoppingCart size={20} />}
                trend="down"
                trendValue="-2.1%"
              />
            </div>

            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 animate-fadeIn">
              <h2 className="text-lg font-semibold mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <ArrowUpRight size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">New user registered</p>
                        <p className="text-sm text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    <button className="text-sm text-gray-600 hover:text-gray-900">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
