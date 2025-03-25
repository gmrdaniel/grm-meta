import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTikTokVideos, addTikTokVideo, deleteTikTokVideo } from "@/services/tiktokVideoService";
import { TikTokVideo } from "@/types/creator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Clock, Play, Heart, MessageCircle, Share, Plus, Link2 } from "lucide-react";
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

const prepareVideoData = (values: FormValues, creatorId: string): Omit<TikTokVideo, "id" | "created_at" | "updated_at"> => {
  return {
    video_id: values.video_id,
    description: values.description || "",
    create_time: values.create_time || Math.floor(Date.now() / 1000),
    author: values.author || "",
    author_id: values.author_id || "",
    video_definition: values.video_definition || "",
    duration: values.duration || 0,
    number_of_comments: values.number_of_comments || 0,
    number_of_hearts: values.number_of_hearts || 0,
    number_of_plays: values.number_of_plays || 0,
    number_of_reposts: values.number_of_reposts || 0,
    creator_id: creatorId,
  };
};

export function TikTokVideosList({ creatorId }: TikTokVideosListProps) {
  const [isAddVideoDialogOpen, setIsAddVideoDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: videos = [], isLoading, error } = useQuery({
    queryKey: ["tiktokVideos", creatorId],
    queryFn: () => fetchTikTokVideos(creatorId),
    enabled: !!creatorId,
  });

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
    const videoData = prepareVideoData(values, creatorId);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-medium truncate">
                      {video.description || `Video ${video.video_id}`}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" /> 
                      {formatDate(video.create_time)}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 -mt-1 -mr-2"
                    onClick={() => handleDelete(video.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild 
                      className="h-8 text-xs"
                    >
                      <a 
                        href={`https://www.tiktok.com/@${video.author}/video/${video.video_id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <Link2 className="h-3 w-3" /> Ver en TikTok
                      </a>
                    </Button>
                    {video.author && (
                      <span className="text-xs text-gray-500">
                        @{video.author}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 text-center text-xs text-gray-600">
                    <div className="flex flex-col items-center">
                      <Play className="h-4 w-4 mb-1 text-blue-500" />
                      <span className="font-medium">{formatNumber(video.number_of_plays)}</span>
                      <span className="text-[10px]">Reproducciones</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Heart className="h-4 w-4 mb-1 text-red-500" />
                      <span className="font-medium">{formatNumber(video.number_of_hearts)}</span>
                      <span className="text-[10px]">Likes</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <MessageCircle className="h-4 w-4 mb-1 text-purple-500" />
                      <span className="font-medium">{formatNumber(video.number_of_comments)}</span>
                      <span className="text-[10px]">Comentarios</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Share className="h-4 w-4 mb-1 text-green-500" />
                      <span className="font-medium">{formatNumber(video.number_of_reposts)}</span>
                      <span className="text-[10px]">Compartidos</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 text-xs text-gray-500 flex justify-between">
                <div>
                  {video.video_definition && (
                    <span className="mr-2">{video.video_definition}</span>
                  )}
                  {video.duration && (
                    <span>{formatDuration(video.duration)}</span>
                  )}
                </div>
                <div>ID: {video.video_id.slice(0, 8)}...</div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
