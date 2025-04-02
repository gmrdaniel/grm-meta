
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
            <TableHead className="w-[200px]">Creador</TableHead>
            <TableHead className="w-[180px]">Redes Sociales</TableHead>
            <TableHead className="w-[120px]">Engagement</TableHead>
            <TableHead className="w-[150px]">Elegibilidad</TableHead>
            <TableHead className="w-[150px]">Duración Prom.</TableHead>
            <TableHead className="w-[120px]">Último Post</TableHead>
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
