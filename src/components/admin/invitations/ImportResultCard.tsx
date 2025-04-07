
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ImportError {
  row: number;
  data: {
    name: string;
    email: string;
    socialMediaHandle: string;
    socialMediaType: string;
  };
  error: string;
}

interface ImportResultCardProps {
  importErrors: ImportError[];
  importSuccess: number;
}

export function ImportResultCard({ importErrors, importSuccess }: ImportResultCardProps) {
  if (importErrors.length === 0 && importSuccess === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Results</CardTitle>
        <CardDescription>
          {importSuccess > 0 && importErrors.length > 0
            ? `Imported ${importSuccess} invitations with ${importErrors.length} errors`
            : importSuccess > 0
            ? `Successfully imported ${importSuccess} invitations`
            : `Import failed with ${importErrors.length} errors`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {importSuccess > 0 && (
          <Alert variant="default" className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Import successful</AlertTitle>
            <AlertDescription>
              {importSuccess} invitations were imported successfully
            </AlertDescription>
          </Alert>
        )}
        
        {importErrors.length > 0 && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Import errors</AlertTitle>
              <AlertDescription>
                Found errors in {importErrors.length} records
              </AlertDescription>
            </Alert>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importErrors.map((error, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{error.row}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div><span className="font-medium">Name:</span> {error.data.name || '-'}</div>
                          <div><span className="font-medium">Email:</span> {error.data.email || '-'}</div>
                          <div><span className="font-medium">Handle:</span> {error.data.socialMediaHandle || '-'}</div>
                          <div><span className="font-medium">Platform:</span> {error.data.socialMediaType || '-'}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-red-600">{error.error}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
