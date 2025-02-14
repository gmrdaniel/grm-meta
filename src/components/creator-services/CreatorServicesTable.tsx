
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import { format } from "date-fns";

interface CreatorService {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  services: {
    id: string;
    name: string;
    type: string;
  };
  profiles: {
    id: string;
    personal_data?: {
      first_name: string | null;
      last_name: string | null;
    };
  };
}

export function CreatorServicesTable() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceType, setServiceType] = useState<string>("");
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["creator-services", page, searchTerm, serviceType],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("creator_services")
        .select(
          `
          id,
          status,
          created_at,
          updated_at,
          services (
            id,
            name,
            type
          ),
          profiles (
            id,
            personal_data (
              first_name,
              last_name
            )
          )
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      if (serviceType) {
        query = query.eq("services.type", serviceType);
      }

      if (searchTerm) {
        query = query.textSearch(
          "profiles.personal_data.first_name",
          searchTerm,
          {
            type: "websearch",
            config: "english",
          }
        );
      }

      const { data, count, error } = await query;

      if (error) throw error;

      return {
        creatorServices: data as CreatorService[],
        total: count || 0,
      };
    },
  });

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Creator Services</h2>
          <p className="text-sm text-muted-foreground">
            Manage all creator services in the platform
          </p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by creator name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={serviceType} onValueChange={setServiceType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All types</SelectItem>
            <SelectItem value="único">Único</SelectItem>
            <SelectItem value="recurrente">Recurrente</SelectItem>
            <SelectItem value="contrato">Contrato</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Creator</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data?.creatorServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No creator services found
                </TableCell>
              </TableRow>
            ) : (
              data?.creatorServices.map((cs) => (
                <TableRow key={cs.id}>
                  <TableCell>
                    {cs.profiles.personal_data?.first_name || "Not set"}{" "}
                    {cs.profiles.personal_data?.last_name || ""}
                  </TableCell>
                  <TableCell>{cs.services.name}</TableCell>
                  <TableCell className="capitalize">{cs.services.type}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        cs.status === "active"
                          ? "bg-green-100 text-green-700"
                          : cs.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {cs.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(cs.created_at), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(cs.updated_at), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(1)}
          disabled={page === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(totalPages)}
          disabled={page >= totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
