
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
import { Eye, Instagram, User } from "lucide-react";

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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Creators</h2>
          <p className="text-sm text-muted-foreground">
            Here's a list of all creators in the platform
          </p>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Creator</TableHead>
              <TableHead>Instagram</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creators.map((creator) => (
              <TableRow key={creator.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {creator.personal_data?.first_name || "Not set"}{" "}
                        {creator.personal_data?.last_name || ""}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {creator.personal_data?.instagram_username ? (
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      <a
                        href={`https://instagram.com/${creator.personal_data.instagram_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        @{creator.personal_data.instagram_username}
                      </a>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(creator.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Link to={`/admin/creators/${creator.id}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {creators.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No creators found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
