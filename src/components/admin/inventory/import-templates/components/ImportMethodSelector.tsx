
import { Button } from "@/components/ui/button";

interface ImportMethodSelectorProps {
  importMethod: 'csv' | 'excel';
  setImportMethod: (method: 'csv' | 'excel') => void;
}

export function ImportMethodSelector({ importMethod, setImportMethod }: ImportMethodSelectorProps) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-2">Choose an import method:</h3>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant={importMethod === 'csv' ? 'default' : 'outline'}
          onClick={() => setImportMethod('csv')}
        >
          CSV Text
        </Button>
        <Button 
          size="sm" 
          variant={importMethod === 'excel' ? 'default' : 'outline'}
          onClick={() => setImportMethod('excel')}
        >
          Excel file
        </Button>
      </div>
    </div>
  );
}
