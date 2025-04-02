
import { Calendar, Clock, Users } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { SummaryCreator } from "./types";

interface CreatorRowProps {
  creator: SummaryCreator;
  index: number;
  currentPage: number;
  pageSize: number;
}

export function CreatorRow({ 
  creator, 
  index, 
  currentPage, 
  pageSize 
}: CreatorRowProps) {
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
  
  const formatDuration = (seconds?: number) => {
    if (seconds === undefined || seconds === null) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return format(new Date(timestamp * 1000), "MMM d, yyyy");
  };

  const isEligibleForTikTok = (creator: SummaryCreator) => {
    return creator.seguidores_tiktok >= 100000 && creator.engagement >= 4;
  };

  return (
    <TableRow>
      <TableCell className="text-center font-medium">
        {(currentPage - 1) * pageSize + index + 1}
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{creator.nombre} {creator.apellido}</div>
          <div className="text-sm text-muted-foreground">{creator.correo}</div>
        </div>
      </TableCell>
      <TableCell>
        {creator.usuario_tiktok ? (
          <a 
            href={`https://tiktok.com/@${creator.usuario_tiktok}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            @{creator.usuario_tiktok}
          </a>
        ) : (
          <span className="text-gray-500">-</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-gray-500" />
          {formatFollowers(creator.seguidores_tiktok)}
        </div>
      </TableCell>
      <TableCell>{formatEngagement(creator.engagement)}</TableCell>
      <TableCell>
        {isEligibleForTikTok(creator) ? (
          <Badge className="bg-green-500">Elegible</Badge>
        ) : (
          <Badge variant="outline" className="text-gray-500">No elegible</Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-gray-500" />
          {formatDuration(creator.duration_average)}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-gray-500" />
          {formatDate(creator.date_last_post)}
        </div>
      </TableCell>
    </TableRow>
  );
}
