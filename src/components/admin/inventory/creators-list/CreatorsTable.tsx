
import { Creator } from "@/types/creator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { CreatorRow } from "./CreatorRow";

interface CreatorsTableProps {
  creators: Creator[];
  onCreatorSelect?: (creator: Creator) => void;
  onEdit: (creator: Creator) => void;
  onRefetch: () => void;
  selectedCreators: Creator[];
  selectAll: boolean;
  onSelectAll: () => void;
  onSelectCreator: (creator: Creator) => void;
}

export function CreatorsTable({
  creators,
  onCreatorSelect,
  onEdit,
  onRefetch,
  selectedCreators,
  selectAll,
  onSelectAll,
  onSelectCreator,
}: CreatorsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox 
                checked={selectAll}
                onCheckedChange={onSelectAll}
                aria-label="Seleccionar todos"
              />
            </TableHead>
            <TableHead className="w-[250px]">Creador</TableHead>
            <TableHead className="w-[300px]">Redes Sociales</TableHead>
            <TableHead className="w-[180px]">Teléfono</TableHead>
            <TableHead className="w-[150px]">Fecha</TableHead>
            <TableHead className="w-[120px]">Estatus</TableHead>
            <TableHead className="w-[120px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {creators.map((creator) => (
            <CreatorRow 
              key={creator.id}
              creator={creator}
              onCreatorSelect={onCreatorSelect}
              onEdit={onEdit}
              onRefetch={onRefetch}
              isSelected={selectedCreators.some(c => c.id === creator.id)}
              onSelectChange={() => onSelectCreator(creator)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
