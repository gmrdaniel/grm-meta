
import { Creator } from "@/types/creator";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Phone, User } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreatorBasicInfo } from "./CreatorBasicInfo";
import { SocialNetworks } from "./SocialNetworks";
import { formatDate } from "./utils";
import { AssignUserDropdown } from "./AssignUserDropdown";

interface CreatorRowProps {
  creator: Creator;
  onCreatorSelect?: (creator: Creator) => void;
  onEdit: (creator: Creator) => void;
  onRefetch: () => void;
  isSelected?: boolean;
  onSelectChange?: () => void;
}

export function CreatorRow({ 
  creator, 
  onCreatorSelect, 
  onEdit, 
  onRefetch,
  isSelected = false,
  onSelectChange
}: CreatorRowProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(creator);
  };

  const handleRowClick = () => {
    if (onCreatorSelect) {
      onCreatorSelect(creator);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectChange) {
      onSelectChange();
    }
  };

  return (
    <TableRow 
      key={creator.id}
      className={onCreatorSelect ? "cursor-pointer hover:bg-gray-100" : undefined}
      onClick={onCreatorSelect ? handleRowClick : undefined}
    >
      <TableCell onClick={handleCheckboxClick}>
        <Checkbox 
          checked={isSelected}
          className="cursor-pointer"
          aria-label={`Seleccionar ${creator.nombre} ${creator.apellido}`}
        />
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <CreatorBasicInfo creator={creator} />
          {creator.usuario_asignado && (
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <User className="h-3 w-3 mr-1" />
              <span>Asignado a usuario</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <SocialNetworks
          usuario_tiktok={creator.usuario_tiktok}
          seguidores_tiktok={creator.seguidores_tiktok}
          elegible_tiktok={creator.elegible_tiktok}
          engagement_tiktok={creator.engagement_tiktok}
          usuario_youtube={creator.usuario_youtube}
          seguidores_youtube={creator.seguidores_youtube}
          elegible_youtube={creator.elegible_youtube}
          engagement_youtube={creator.engagement_youtube}
          usuario_pinterest={creator.usuario_pinterest}
          seguidores_pinterest={creator.seguidores_pinterest}
          page_facebook={creator.page_facebook}
          creatorId={creator.id}
          onRefetch={onRefetch}
        />
      </TableCell>
      <TableCell>
        {creator.telefono ? (
          <div className="flex items-center gap-1">
            <Phone className="h-4 w-4 text-gray-500" /> 
            {creator.lada_telefono && `+${creator.lada_telefono} `}
            {creator.telefono}
          </div>
        ) : (
          <span className="text-gray-500">No disponible</span>
        )}
      </TableCell>
      <TableCell>{formatDate(creator.fecha_creacion)}</TableCell>
      <TableCell>
        <Badge
          variant={
            creator.estatus === "activo"
              ? "default"
              : creator.estatus === "inactivo"
              ? "destructive"
              : "secondary"
          }
          className="capitalize"
        >
          {creator.estatus}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <AssignUserDropdown
            creatorId={creator.id}
            currentUserId={creator.usuario_asignado || null}
            onSuccess={onRefetch}
            showIcon={false}
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  if (onCreatorSelect) {
                    e.stopPropagation();
                  }
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <button 
                  className="flex w-full items-center px-2 py-1.5 text-sm"
                  onClick={handleEdit}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
