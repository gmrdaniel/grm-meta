
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorDisplayProps {
  error: string | null;
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mt-2">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
