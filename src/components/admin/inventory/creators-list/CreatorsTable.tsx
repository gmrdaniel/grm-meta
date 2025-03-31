
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Creator } from "@/types/creator";
import { CreatorItem } from "./CreatorItem";

interface CreatorsTableProps {
  creators: Creator[];
  selectedCreators: string[];
  setSelectedCreators: (ids: string[]) => void;
  onEditClick: (creator: Creator) => void;
  onTikTokInfoClick: (creatorId: string, username: string) => void;
  onTikTokVideosClick: (creatorId: string, username: string) => void;
  loadingTikTokInfo: string | null;
  loadingTikTokVideos: string | null;
  onCreatorSelect?: (creator: Creator) => void;
}

export function CreatorsTable({
  creators,
  selectedCreators,
  setSelectedCreators,
  onEditClick,
  onTikTokInfoClick,
  onTikTokVideosClick,
  loadingTikTokInfo,
  loadingTikTokVideos,
  onCreatorSelect,
}: CreatorsTableProps) {
  const [selectAll, setSelectAll] = useState(false);

  const toggleCreatorSelection = (creatorId: string) => {
    setSelectedCreators(
      selectedCreators.includes(creatorId)
        ? selectedCreators.filter((id) => id !== creatorId)
        : [...selectedCreators, creatorId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedCreators([]);
    } else {
      setSelectedCreators(creators.map((creator) => creator.id));
    }
    setSelectAll(!selectAll);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectAll}
                onCheckedChange={toggleSelectAll}
                aria-label="Seleccionar todos los creadores"
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
            <CreatorItem
              key={creator.id}
              creator={creator}
              isSelected={selectedCreators.includes(creator.id)}
              onSelect={toggleCreatorSelection}
              onEditClick={onEditClick}
              onTikTokInfoClick={onTikTokInfoClick}
              onTikTokVideosClick={onTikTokVideosClick}
              loadingTikTokInfo={loadingTikTokInfo}
              loadingTikTokVideos={loadingTikTokVideos}
              onCreatorSelect={onCreatorSelect}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
