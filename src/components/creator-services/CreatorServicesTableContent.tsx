
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface CreatorServicesTableContentProps {
  isLoading: boolean;
  creatorServices?: CreatorService[];
}

export function CreatorServicesTableContent({
  isLoading,
  creatorServices,
}: CreatorServicesTableContentProps) {
  return (
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
        ) : !creatorServices?.length ? (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              No creator services found
            </TableCell>
          </TableRow>
        ) : (
          creatorServices.map((cs) => (
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
  );
}
