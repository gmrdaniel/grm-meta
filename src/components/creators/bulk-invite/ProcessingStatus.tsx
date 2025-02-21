
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProcessingStatusProps {
  status: string;
  error: string | null;
}

export function ProcessingStatus({ status, error }: ProcessingStatusProps) {
  return (
    <>
      {status && (
        <div className="mt-2">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            {status}
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </>
  );
}
