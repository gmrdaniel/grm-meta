
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: "up" | "down";
  trendValue?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
}: StatsCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-sm font-medium">{title}</span>
        <span className="text-gray-600 bg-gray-50/50 p-2 rounded-xl">{icon}</span>
      </div>
      
      <div className="mt-4">
        <h3 className="text-3xl font-semibold text-gray-800">{value}</h3>
        <p className="text-gray-500 mt-1 text-sm">{description}</p>
      </div>
      
      {trend && trendValue && (
        <div className="mt-4 flex items-center">
          <span
            className={cn(
              "text-sm font-medium rounded-full px-2 py-0.5",
              trend === "up" ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
            )}
          >
            {trendValue}
          </span>
          <span className="text-gray-500 text-sm ml-2">vs last month</span>
        </div>
      )}
    </div>
  );
}
