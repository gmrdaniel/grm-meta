
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";

interface Creator {
  id: string;
  created_at: string;
  role: string;
  personal_data?: {
    first_name: string | null;
    last_name: string | null;
    instagram_username: string | null;
  };
}

interface CreatorsTableProps {
  creators: Creator[];
}

export function CreatorsTable({ creators }: CreatorsTableProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Instagram Username</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {creators.map((creator) => (
            <TableRow key={creator.id}>
              <TableCell>
                {creator.personal_data?.first_name || "Not set"}
              </TableCell>
              <TableCell>
                {creator.personal_data?.last_name || "Not set"}
              </TableCell>
              <TableCell>
                {creator.personal_data?.instagram_username || "Not set"}
              </TableCell>
              <TableCell>
                {new Date(creator.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Link to={`/admin/creators/${creator.id}`}>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
