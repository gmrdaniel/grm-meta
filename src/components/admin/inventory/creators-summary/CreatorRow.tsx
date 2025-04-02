
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

  const isEligibleForYouTube = (creator: SummaryCreator) => {
    return creator.seguidores_youtube >= 100000;
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
        <div className="space-y-2">
          {creator.usuario_tiktok ? (
            <div>
              <a 
                href={`https://tiktok.com/@${creator.usuario_tiktok}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                @{creator.usuario_tiktok}
              </a>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users className="h-3 w-3" />
                {formatFollowers(creator.seguidores_tiktok)}
              </div>
            </div>
          ) : null}
          
          {creator.usuario_youtube ? (
            <div>
              <a 
                href={`https://youtube.com/@${creator.usuario_youtube}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                @{creator.usuario_youtube}
              </a>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users className="h-3 w-3" />
                {formatFollowers(creator.seguidores_youtube)}
              </div>
            </div>
          ) : null}
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          <div className="flex flex-col">
            <span className="text-xs font-medium">TikTok:</span>
            <span>{formatEngagement(creator.engagement)}</span>
          </div>
          {creator.seguidores_youtube && (
            <div className="flex flex-col">
              <span className="text-xs font-medium">YouTube:</span>
              <span>{formatEngagement(creator.yt_engagement)}</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            {isEligibleForTikTok(creator) ? (
              <Badge className="bg-green-500">TikTok</Badge>
            ) : (
              creator.usuario_tiktok && <Badge variant="outline" className="text-gray-500">No TikTok</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isEligibleForYouTube(creator) ? (
              <Badge className="bg-blue-500">YouTube</Badge>
            ) : (
              creator.usuario_youtube && <Badge variant="outline" className="text-gray-500">No YouTube</Badge>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          <div className="flex flex-col">
            <span className="text-xs font-medium">TikTok:</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-gray-500" />
              {formatDuration(creator.duration_average)}
            </div>
          </div>
          {creator.yt_average_duration > 0 && (
            <div className="flex flex-col">
              <span className="text-xs font-medium">YouTube:</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-500" />
                {formatDuration(creator.yt_average_duration)}
              </div>
            </div>
          )}
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
