import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTikTokVideos, addTikTokVideo, deleteTikTokVideo } from "@/services/tiktokVideoService";
import { TikTokVideo } from "@/types/creator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Clock, Play, Heart, MessageCircle, Share, Plus, Link2, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface TikTokVideosListProps {
  creatorId: string;
}

const formSchema = z.object({
  video_id: z.string().min(1, { message: "El ID del video es requerido" }),
  description: z.string().optional(),
  create_time: z.number().optional(),
  author: z.string().optional(),
  author_id: z.string().optional(),
  video_definition: z.string().optional(),
  duration: z.number().optional(),
  number_of_comments: z.number().optional(),
  number_of_hearts: z.number().optional(),
  number_of_plays: z.number().optional(),
  number_of_reposts: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function mapToNewTikTokVideo(data: Partial<Omit<TikTokVideo, "id" | "created_at" | "updated_at">> & { creator_id: string }): Omit<TikTokVideo, "id" | "created_at" | "updated_at"> {
  if (!data.video_id) {
    throw new Error("video_id es obligatorio");
  }

  return {
    video_id: data.video_id,
    description: data.description ?? "",
    create_time: data.create_time ?? Math.floor(Date.now() / 1000),
    author: data.author ?? "",
    author_id: data.author_id ?? "",
    video_definition: data.video_definition ?? "unknown",
    duration: data.duration ?? 0,
    number_of_comments: data.number_of_comments ?? 0,
    number_of_hearts: data.number_of_hearts ?? 0,
    number_of_plays: data.number_of_plays ?? 0,
    number_of_reposts: data.number_of_reposts ?? 0,
    creator_id: data.creator_id
  };
}

export function TikTokVideosList({ creatorId }: TikTokVideosListProps) {
  const [isAddVideoDialogOpen, setIsAddVideoDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: videosData, isLoading, error } = useQuery({
    queryKey: ["tiktokVideos", creatorId],
    queryFn: () => fetchTikTokVideos(creatorId),
    enabled: !!creatorId,
  });

  // Extract videos array from the response
  const videos = videosData?.data || [];

  const addVideoMutation = useMutation({
    mutationFn: addTikTokVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiktokVideos", creatorId] });
      toast.success("Video añadido correctamente");
      setIsAddVideoDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error al añadir el video: ${error.message}`);
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: deleteTikTokVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiktokVideos", creatorId] });
      toast.success("Video eliminado correctamente");
    },
    onError: (error) => {
      toast.error(`Error al eliminar el video: ${error.message}`);
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      video_id: "",
      description: "",
      create_time: undefined,
      author: "",
      author_id: "",
      video_definition: "",
      duration: undefined,
      number_of_comments: undefined,
      number_of_hearts: undefined,
      number_of_plays: undefined,
      number_of_reposts: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const videoData = mapToNewTikTokVideo({
      ...values,
      creator_id: creatorId
    });
    
    addVideoMutation.mutate(videoData);
  };

  const formatNumber = (num?: number): string => {
    if (num === undefined) return "N/A";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const calculateTotalEngagement = (video: TikTokVideo): number => {
    return (video.number_of_hearts || 0) + 
           (video.number_of_comments || 0) + 
           (video.number_of_reposts || 0);
  };

  const handleDelete = (videoId: string) => {
    if (window.confirm("¿Estás seguro de eliminar este video?")) {
      deleteVideoMutation.mutate(videoId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        Error al cargar los videos: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Videos de TikTok</h2>
        <Dialog open={isAddVideoDialogOpen} onOpenChange={setIsAddVideoDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              <Plus className="mr-2 h-4 w-4" /> Añadir Video
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Añadir Video de TikTok</DialogTitle>
              <DialogDescription>
                Ingresa la información del video de TikTok.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="video_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID del Video*</FormLabel>
                      <FormControl>
                        <Input placeholder="7229017548413570350" {...field} />
                      </FormControl>
                      <FormDescription>
                        El ID único del video en TikTok.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descripción del video..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Autor</FormLabel>
                        <FormControl>
                          <Input placeholder="mrbeast" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="author_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID del Autor</FormLabel>
                        <FormControl>
                          <Input placeholder="6614519312189947909" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="create_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Creación (UNIX)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="1683136828" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duración (segundos)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="16" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="video_definition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Definición del Video</FormLabel>
                      <FormControl>
                        <Input placeholder="720p" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="stats">
                    <AccordionTrigger>Estadísticas del Video</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="number_of_comments"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Comentarios</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="152700" 
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="number_of_hearts"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Likes</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="12600000" 
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="number_of_plays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reproducciones</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="108100000" 
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="number_of_reposts"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Compartidos</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="434200" 
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <DialogFooter>
                  <Button type="submit" disabled={addVideoMutation.isPending}>
                    {addVideoMutation.isPending ? "Añadiendo..." : "Añadir Video"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {videos.length === 0 ? (
        <div className="p-6 text-center text-gray-500 border rounded-md">
          No hay videos registrados para este creador.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableCaption>Lista de videos de TikTok</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Descripción</TableHead>
                <TableHead className="w-[120px]">Fecha</TableHead>
                <TableHead className="text-right">Reproducciones</TableHead>
                <TableHead className="text-right">Likes</TableHead>
                <TableHead className="text-right">Comentarios</TableHead>
                <TableHead className="text-right">Compartidos</TableHead>
                <TableHead className="text-right">Engagement Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="truncate max-w-[280px]">{video.description || `Video ${video.video_id.slice(0, 8)}...`}</span>
                      <span className="text-xs text-muted-foreground">
                        @{video.author || "desconocido"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(video.create_time)}</TableCell>
                  <TableCell className="text-right font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <Play className="h-3 w-3 text-blue-500" />
                      {formatNumber(video.number_of_plays)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <Heart className="h-3 w-3 text-red-500" />
                      {formatNumber(video.number_of_hearts)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <MessageCircle className="h-3 w-3 text-purple-500" />
                      {formatNumber(video.number_of_comments)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <Share className="h-3 w-3 text-green-500" />
                      {formatNumber(video.number_of_reposts)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(calculateTotalEngagement(video))}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        asChild
                        className="h-8 w-8 p-0"
                      >
                        <a 
                          href={`https://www.tiktok.com/@${video.author}/video/${video.video_id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          title="Ver en TikTok"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(video.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
