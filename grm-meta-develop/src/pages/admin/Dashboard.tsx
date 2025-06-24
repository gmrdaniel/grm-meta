
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { StatsCard } from "@/components/StatsCard";
import { Users, DollarSign, ShoppingCart } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
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
          </div>
        </main>
      </div>
    </div>
  );
}
