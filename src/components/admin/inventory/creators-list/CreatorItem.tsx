
import { format } from "date-fns";
import { Download, ExternalLink, Loader2, Mail, MoreHorizontal, Pencil, Phone, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { CreatorItemProps } from "./types";

export function CreatorItem({
  creator,
  isSelected,
  onSelect,
  onEditClick,
  onTikTokInfoClick,
  onTikTokVideosClick,
  loadingTikTokInfo,
  loadingTikTokVideos,
  onCreatorSelect,
}: CreatorItemProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "N/A";
    }
  };

  const formatFollowers = (count?: number) => {
    if (count === undefined || count === null) return "N/A";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatEngagement = (rate?: number) => {
    if (rate === undefined || rate === null) return "N/A";
    return `${rate.toFixed(2)}%`;
  };

  return (
    <TableRow 
      className={onCreatorSelect ? "cursor-pointer hover:bg-gray-100" : undefined}
      onClick={onCreatorSelect ? (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-checkbox]')) {
          e.stopPropagation();
          return;
        }
        onCreatorSelect(creator);
      } : undefined}
    >
      <TableCell>
        <div data-checkbox>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(creator.id)}
            aria-label={`Seleccionar ${creator.nombre} ${creator.apellido}`}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
            {getInitials(creator.nombre, creator.apellido)}
          </div>
          <div>
            <div className="font-medium">{creator.nombre} {creator.apellido}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" /> {creator.correo}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          {creator.usuario_tiktok && (
            <div className="text-sm">
              <div className="flex items-center gap-1">
                <span className="font-medium">TikTok:</span> 
                <a href={`https://tiktok.com/@${creator.usuario_tiktok}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline">
                  @{creator.usuario_tiktok}
                  <ExternalLink className="h-3 w-3" />
                </a>
                {creator.seguidores_tiktok && (
                  <span className="ml-2 flex items-center text-gray-500 text-xs">
                    <Users className="h-3 w-3 mr-1" /> {formatFollowers(creator.seguidores_tiktok)}
                  </span>
                )}
                <div className="flex gap-1 ml-1">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="h-6 rounded-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTikTokInfoClick(creator.id, creator.usuario_tiktok || '');
                    }}
                    disabled={loadingTikTokInfo === creator.id || loadingTikTokVideos === creator.id}
                  >
                    {loadingTikTokInfo === creator.id ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <svg 
                        viewBox="0 0 24 24"
                        className="h-3 w-3 mr-1"
                        fill="currentColor"
                      >
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                    )}
                    Info
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="h-6 rounded-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTikTokVideosClick(creator.id, creator.usuario_tiktok || '');
                    }}
                    disabled={loadingTikTokInfo === creator.id || loadingTikTokVideos === creator.id}
                  >
                    {loadingTikTokVideos === creator.id ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Download className="h-3 w-3 mr-1" />
                    )}
                    Videos
                  </Button>
                </div>
              </div>
              <div className="flex gap-3 mt-1 text-xs">
                <span className={`flex items-center ${creator.elegible_tiktok ? 'text-green-500' : 'text-gray-400'}`}>
                  {creator.elegible_tiktok ? 'Elegible' : 'No elegible'}
                </span>
                {creator.engagement_tiktok && (
                  <span className="flex items-center text-gray-500">
                    Engagement: {formatEngagement(creator.engagement_tiktok)}
                  </span>
                )}
              </div>
            </div>
          )}
          {creator.usuario_youtube && (
            <div className="text-sm">
              <div className="flex items-center gap-1">
                <span className="font-medium">YouTube:</span> 
                <a href={`https://youtube.com/@${creator.usuario_youtube}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline">
                  @{creator.usuario_youtube}
                  <ExternalLink className="h-3 w-3" />
                </a>
                {creator.seguidores_youtube && (
                  <span className="ml-2 flex items-center text-gray-500 text-xs">
                    <Users className="h-3 w-3 mr-1" /> {formatFollowers(creator.seguidores_youtube)}
                  </span>
                )}
              </div>
              <div className="flex gap-3 mt-1 text-xs">
                <span className={`flex items-center ${creator.elegible_youtube ? 'text-green-500' : 'text-gray-400'}`}>
                  {creator.elegible_youtube ? 'Elegible' : 'No elegible'}
                </span>
                {creator.engagement_youtube && (
                  <span className="flex items-center text-gray-500">
                    Engagement: {formatEngagement(creator.engagement_youtube)}
                  </span>
                )}
              </div>
            </div>
          )}
          {creator.usuario_pinterest && (
            <div className="text-sm flex items-center gap-1">
              <span className="font-medium">Pinterest:</span> 
              <a href={`https://pinterest.com/${creator.usuario_pinterest}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline">
                @{creator.usuario_pinterest}
                <ExternalLink className="h-3 w-3" />
              </a>
              {creator.seguidores_pinterest && (
                <span className="ml-2 flex items-center text-gray-500 text-xs">
                  <Users className="h-3 w-3 mr-1" /> {formatFollowers(creator.seguidores_pinterest)}
                </span>
              )}
            </div>
          )}
          {creator.page_facebook && (
            <div className="text-sm flex items-center gap-1">
              <span className="font-medium">Facebook:</span> 
              <a href={creator.page_facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline">
                Página
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
          {!creator.usuario_tiktok && !creator.usuario_pinterest && !creator.usuario_youtube && !creator.page_facebook && (
            <span className="text-sm text-gray-500">Sin redes sociales</span>
          )}
        </div>
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
            <DropdownMenuItem 
              onClick={(e) => {
                if (onCreatorSelect) {
                  e.stopPropagation();
                }
                onEditClick(creator);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
