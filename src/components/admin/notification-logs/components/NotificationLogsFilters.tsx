
// import { useState } from "react";
// import { CalendarIcon, FilterIcon } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { DateRange, FilterState } from "../hooks/useNotificationLogs";
// import { Badge } from "@/components/ui/badge";
// import { format } from "date-fns";

// interface NotificationLogsFiltersProps {
//   filters: FilterState;
//   setFilters: (filters: FilterState) => void;
//   clearFilters: () => void;
//   activeFiltersCount: number;
// }

// export function NotificationLogsFilters({
//   filters,
//   setFilters,
//   clearFilters,
//   activeFiltersCount
// }: NotificationLogsFiltersProps) {
//   const [date, setDate] = useState<DateRange>({ from: filters.dateRange.from, to: filters.dateRange.to });

//   const handleDateSelect = (range: DateRange) => {
//     setDate(range);
    
//     if (range.from || range.to) {
//       setFilters({
//         ...filters,
//         dateRange: range
//       });
//     }
//   };

//   const handleStatusChange = (value: string) => {
//     setFilters({
//       ...filters,
//       status: value === "all" ? null : value
//     });
//   };

//   return (
//     <div className="flex flex-wrap gap-2 mb-4">
//       <Popover>
//         <PopoverTrigger asChild>
//           <Button variant="outline" className="flex items-center gap-2">
//             <CalendarIcon className="h-4 w-4" />
//             <span>
//               {filters.dateRange.from ? (
//                 filters.dateRange.to ? (
//                   <>
//                     {format(filters.dateRange.from, "MMM d, yyyy")} - {format(filters.dateRange.to, "MMM d, yyyy")}
//                   </>
//                 ) : (
//                   format(filters.dateRange.from, "MMM d, yyyy")
//                 )
//               ) : filters.dateRange.to ? (
//                 <>Until {format(filters.dateRange.to, "MMM d, yyyy")}</>
//               ) : (
//                 "Date Range"
//               )}
//             </span>
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent className="w-auto p-0" align="start">
//           <Calendar
//             mode="range"
//             selected={date}
//             onSelect={handleDateSelect}
//             initialFocus
//             className="p-3 pointer-events-auto"
//           />
//         </PopoverContent>
//       </Popover>

//       <Select
//         value={filters.status || "all"}
//         onValueChange={handleStatusChange}
//       >
//         <SelectTrigger className="w-[150px]">
//           <SelectValue placeholder="Status" />
//         </SelectTrigger>
//         <SelectContent>
//           <SelectItem value="all">All Statuses</SelectItem>
//           <SelectItem value="sent">Sent</SelectItem>
//           <SelectItem value="failed">Failed</SelectItem>
//           <SelectItem value="pending">Pending</SelectItem>
//         </SelectContent>
//       </Select>
      
//       {activeFiltersCount > 0 && (
//         <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2">
//           Clear Filters
//           <Badge variant="secondary" className="ml-1">
//             {activeFiltersCount}
//           </Badge>
//         </Button>
//       )}
//     </div>
//   );
// }