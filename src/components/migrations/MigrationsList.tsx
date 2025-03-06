
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";

interface Migration {
  id: number;
  migration_name: string;
  description: string | null;
  sql_commands: string;
  environment: string;
  applied_at: string;
  applied_by: string | null;
  is_applied: boolean;
  version: string | null;
}

interface MigrationsListProps {
  migrations: Migration[];
  onRefresh: () => void;
}

export function MigrationsList({ migrations, onRefresh }: MigrationsListProps) {
  const [viewSql, setViewSql] = useState<string | null>(null);
  const [selectedMigration, setSelectedMigration] = useState<Migration | null>(null);

  const handleViewSql = (migration: Migration) => {
    setSelectedMigration(migration);
    setViewSql(migration.sql_commands);
  };

  const handleCopySql = () => {
    if (viewSql) {
      navigator.clipboard.writeText(viewSql);
      // Use browser's alert for simplicity as toast might not be visible in modal
      alert("SQL commands copied to clipboard!");
    }
  };

  return (
    <div>
      {migrations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No database migrations found for this environment.
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Applied At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {migrations.map((migration) => (
                <TableRow key={migration.id}>
                  <TableCell className="font-medium">
                    {migration.migration_name}
                    {migration.description && (
                      <p className="text-xs text-gray-500 mt-1">{migration.description}</p>
                    )}
                  </TableCell>
                  <TableCell>{migration.version || "—"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      migration.environment === "production" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {migration.environment}
                    </span>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(migration.applied_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewSql(migration)}
                    >
                      View SQL
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Dialog open={viewSql !== null} onOpenChange={(open) => !open && setViewSql(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedMigration?.migration_name} 
                  {selectedMigration?.version && ` (v${selectedMigration.version})`}
                </DialogTitle>
                <DialogDescription>
                  {selectedMigration?.description || "No description provided."}
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">SQL Commands</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCopySql}
                  >
                    Copy to Clipboard
                  </Button>
                </div>
                <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm font-mono">
                  {viewSql}
                </pre>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
