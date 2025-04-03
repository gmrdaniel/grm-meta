
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchYouTubeShorts } from "@/services/youtubeShortsService";
import { Clock, Calendar, Eye, ThumbsUp, MessageSquare } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface YouTubeShortsVideosListProps {
  creatorId: string;
}

export function YouTubeShortsVideosList({ creatorId }: YouTubeShortsVideosListProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["youtube-shorts", creatorId],
    queryFn: () => fetchYouTubeShorts(creatorId),
    enabled: !!creatorId,
  });

  const formatDuration = (seconds?: number) => {
    if (seconds === undefined || seconds === null) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return "N/A";
    return num.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>No se pudieron cargar los videos de YouTube</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  const videos = data?.data || [];

  if (videos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Videos de YouTube Shorts</CardTitle>
          <CardDescription>No hay videos disponibles para este creador</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Videos de YouTube Shorts</CardTitle>
          <CardDescription>
            {videos.length} videos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Vistas</TableHead>
                  <TableHead>Likes</TableHead>
                  <TableHead>Comentarios</TableHead>
                  <TableHead>Fecha Publicación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {video.title || `YouTube Short ${video.video_id.substring(0, 6)}...`}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" /> 
                        {formatDuration(video.duration)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-gray-500" /> 
                        {formatNumber(video.views)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4 text-gray-500" /> 
                        {formatNumber(video.likes)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-gray-500" /> 
                        {formatNumber(video.comments)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" /> 
                        {video.published_date 
                          ? format(new Date(video.published_date), "dd/MM/yyyy")
                          : "N/A"
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
