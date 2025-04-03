
import { useState } from "react";
import { Download, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SummaryHeaderProps {
  totalCount: number;
  pageSize: number;
  onPageSizeChange: (value: string) => void;
  isExporting: boolean;
  onExport: () => Promise<void>;
  isExportingYouTube: boolean;
  onExportYouTube: () => Promise<void>;
}

export function SummaryHeader({
  totalCount,
  pageSize,
  onPageSizeChange,
  isExporting,
  onExport,
  isExportingYouTube,
  onExportYouTube
}: SummaryHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <h2 className="text-2xl font-bold">Resumen de Creadores</h2>
        <p className="text-gray-500">Total: {totalCount} creadores</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-gray-500">Resultados por página:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={onPageSizeChange}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex gap-2 self-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={isExporting || isExportingYouTube}
          className="flex items-center gap-1"
        >
          {isExporting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Exportar Elegibles TikTok
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onExportYouTube}
          disabled={isExporting || isExportingYouTube}
          className="flex items-center gap-1"
        >
          {isExportingYouTube ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
          ) : (
            <Youtube className="h-4 w-4" />
          )}
          Exportar Elegibles YouTube
        </Button>
      </div>
    </div>
  );
}
