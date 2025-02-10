
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
    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-sm">{title}</span>
        <span className="text-gray-600">{icon}</span>
      </div>
      
      <div className="mt-4">
        <h3 className="text-3xl font-semibold">{value}</h3>
        <p className="text-gray-500 mt-1 text-sm">{description}</p>
      </div>
      
      {trend && trendValue && (
        <div className="mt-4 flex items-center">
          <span
            className={cn(
              "text-sm font-medium",
              trend === "up" ? "text-green-600" : "text-red-600"
            )}
          >
            {trendValue}
          </span>
          <span className="text-gray-500 text-sm ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
}
