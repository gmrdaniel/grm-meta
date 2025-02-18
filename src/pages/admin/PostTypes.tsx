import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Power } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { PostTypeDialog } from "@/components/post-types/PostTypeDialog";
import { SocialPlatformDialog } from "@/components/post-types/SocialPlatformDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type SocialPlatform = Database["public"]["Tables"]["social_platforms"]["Row"];
type PostType = Database["public"]["Tables"]["post_types"]["Row"] & {
  social_platforms: Pick<SocialPlatform, "name">;
};

function groupPostTypesBySocialPlatform(postTypes: PostType[]) {
  const grouped: { [key: string]: PostType[] } = {};
  
  postTypes.forEach((postType) => {
    const platformName = postType.social_platforms.name;
    if (!grouped[platformName]) {
      grouped[platformName] = [];
    }
    grouped[platformName].push(postType);
  });
  
  return grouped;
}

export default function PostTypes() {
  const [postTypeDialogOpen, setPostTypeDialogOpen] = useState(false);
  const [platformDialogOpen, setPlatformDialogOpen] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState<PostType | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);

  const { data: postTypes = [], refetch: refetchPostTypes } = useQuery({
    queryKey: ["postTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_types")
        .select(`
          *,
          social_platforms (
            name
          )
        `)
        .order("social_platforms(name)");

      if (error) throw error;
      return data as PostType[];
    },
  });

  const { data: platforms = [], refetch: refetchPlatforms } = useQuery({
    queryKey: ["platforms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_platforms")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as SocialPlatform[];
    },
  });

  const groupedPostTypes = groupPostTypesBySocialPlatform(postTypes);

  async function handlePostTypeStatusToggle(postType: PostType) {
    try {
      const newStatus = postType.status === "active" ? "inactive" : "active";
      const { error } = await supabase
        .from("post_types")
        .update({ status: newStatus })
        .eq("id", postType.id);

      if (error) throw error;

      toast.success(
        `Tipo de publicación ${
          newStatus === "active" ? "activado" : "desactivado"
        } correctamente`
      );
      refetchPostTypes();
    } catch (error: any) {
      toast.error("Error al actualizar el estado");
      console.error("Error:", error);
    }
  }

  async function handlePlatformStatusToggle(platform: SocialPlatform) {
    try {
      const newStatus = platform.status === "active" ? "inactive" : "active";
      const { error } = await supabase
        .from("social_platforms")
        .update({ status: newStatus })
        .eq("id", platform.id);

      if (error) throw error;

      toast.success(
        `Red social ${
          newStatus === "active" ? "activada" : "desactivada"
        } correctamente`
      );
      refetchPlatforms();
    } catch (error: any) {
      toast.error("Error al actualizar el estado");
      console.error("Error:", error);
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="platforms">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="platforms">Redes Sociales</TabsTrigger>
            <TabsTrigger value="postTypes">Tipos de Publicación</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="platforms">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Redes Sociales</h2>
            <Button onClick={() => {
              setSelectedPlatform(null);
              setPlatformDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Red Social
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platforms.map((platform) => (
                <TableRow key={platform.id}>
                  <TableCell>{platform.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={platform.status === "active" ? "default" : "secondary"}
                    >
                      {platform.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedPlatform(platform);
                          setPlatformDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePlatformStatusToggle(platform)}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="postTypes">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Tipos de Publicación</h2>
            <Button onClick={() => {
              setSelectedPostType(null);
              setPostTypeDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Tipo
            </Button>
          </div>

          {Object.entries(groupedPostTypes).map(([platformName, platformPostTypes]) => (
            <div key={platformName} className="mb-8">
              <h3 className="text-lg font-semibold mb-4">{platformName}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {platformPostTypes.map((postType) => (
                    <TableRow key={postType.id}>
                      <TableCell>{postType.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={postType.status === "active" ? "default" : "secondary"}
                        >
                          {postType.status === "active" ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedPostType(postType);
                              setPostTypeDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePostTypeStatusToggle(postType)}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <PostTypeDialog
        open={postTypeDialogOpen}
        onOpenChange={setPostTypeDialogOpen}
        postType={selectedPostType}
        onSuccess={refetchPostTypes}
      />

      <SocialPlatformDialog
        open={platformDialogOpen}
        onOpenChange={setPlatformDialogOpen}
        platform={selectedPlatform}
        onSuccess={refetchPlatforms}
      />
    </div>
  );
}
