
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSpreadsheet, FileText } from "lucide-react";

interface ImportMethodSelectorProps {
  importMethod: 'csv' | 'excel';
  setImportMethod: (method: 'csv' | 'excel') => void;
}

export function ImportMethodSelector({ 
  importMethod, 
  setImportMethod 
}: ImportMethodSelectorProps) {
  return (
    <div className="mb-4">
      <Tabs 
        defaultValue={importMethod} 
        value={importMethod} 
        onValueChange={(value) => setImportMethod(value as 'csv' | 'excel')}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>CSV</span>
          </TabsTrigger>
          <TabsTrigger value="excel" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
