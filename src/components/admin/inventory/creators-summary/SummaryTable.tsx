
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreatorRow } from "./CreatorRow";
import { SummaryCreator } from "./types";

interface SummaryTableProps {
  creators: SummaryCreator[];
  currentPage: number;
  pageSize: number;
}

export function SummaryTable({ 
  creators, 
  currentPage, 
  pageSize 
}: SummaryTableProps) {
  if (creators.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 border rounded-md">
        No hay creadores que coincidan con los criterios seleccionados
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] text-center">#</TableHead>
            <TableHead className="w-[250px]">Creador</TableHead>
            <TableHead colSpan={6} className="text-center bg-gray-50">TikTok</TableHead>
            <TableHead colSpan={4} className="text-center bg-gray-100">YouTube</TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="w-[250px]"></TableHead>
            {/* TikTok Columns */}
            <TableHead className="bg-gray-50">Usuario</TableHead>
            <TableHead className="bg-gray-50">Seguidores</TableHead>
            <TableHead className="bg-gray-50">Engagement</TableHead>
            <TableHead className="bg-gray-50">Elegible</TableHead>
            <TableHead className="bg-gray-50">Duración Prom.</TableHead>
            <TableHead className="bg-gray-50">Último Post</TableHead>
            {/* YouTube Columns */}
            <TableHead className="bg-gray-100">Usuario</TableHead>
            <TableHead className="bg-gray-100">Seguidores</TableHead>
            <TableHead className="bg-gray-100">Engagement</TableHead>
            <TableHead className="bg-gray-100">Elegible</TableHead>
            <TableHead className="bg-gray-100">Duración Prom.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {creators.map((creator, index) => (
            <CreatorRow 
              key={index} 
              creator={creator} 
              index={index} 
              currentPage={currentPage} 
              pageSize={pageSize} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
