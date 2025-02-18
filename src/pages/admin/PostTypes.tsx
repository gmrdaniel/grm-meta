
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
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

type SocialPlatform = Database["public"]["Tables"]["social_platforms"]["Row"];
type PostType = Database["public"]["Tables"]["post_types"]["Row"] & {
  social_platforms: Pick<SocialPlatform, "name">;
};

function groupPostTypesBySocialPlatform(postTypes: PostType[]) {
  return postTypes.reduce((acc, postType) => {
    const platformName = postType.social_platforms?.name || "Sin Plataforma";
    if (!acc[platformName]) {
      acc[platformName] = [];
    }
    acc[platformName].push(postType);
    return acc;
  }, {} as Record<string, PostType[]>);
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
        .order("created_at");

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
        .order("created_at");

      if (error) throw error;
      return data;
    },
  });

  const groupedPostTypes = groupPostTypesBySocialPlatform(postTypes);

  const togglePlatformStatus = async (platform: SocialPlatform) => {
    try {
      const { error } = await supabase
        .from("social_platforms")
        .update({ status: platform.status === "active" ? "inactive" : "active" })
        .eq("id", platform.id);

      if (error) throw error;

      toast.success("Estado actualizado correctamente");
      refetchPlatforms();
      refetchPostTypes();
    } catch (error) {
      toast.error("Error al actualizar el estado");
      console.error(error);
    }
  };

  const togglePostTypeStatus = async (postType: PostType) => {
    try {
      const { error } = await supabase
        .from("post_types")
        .update({ status: postType.status === "active" ? "inactive" : "active" })
        .eq("id", postType.id);

      if (error) throw error;

      toast.success("Estado actualizado correctamente");
      refetchPostTypes();
    } catch (error) {
      toast.error("Error al actualizar el estado");
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="platforms">
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="platforms">Redes Sociales</TabsTrigger>
                  <TabsTrigger value="postTypes">Tipos de Publicación</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="platforms">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Redes Sociales</h2>
                    <Button onClick={() => setPlatformDialogOpen(true)}>
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
                          <TableCell className="space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPlatform(platform);
                                setPlatformDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => togglePlatformStatus(platform)}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="postTypes">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Tipos de Publicación</h2>
                    <Button onClick={() => setPostTypeDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nuevo Tipo
                    </Button>
                  </div>

                  {Object.entries(groupedPostTypes).map(([platformName, types]) => (
                    <div key={platformName} className="space-y-4">
                      <h3 className="text-lg font-semibold">{platformName}</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {types.map((postType) => (
                            <TableRow key={postType.id}>
                              <TableCell>{postType.name}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    postType.status === "active" ? "default" : "secondary"
                                  }
                                >
                                  {postType.status === "active" ? "Activo" : "Inactivo"}
                                </Badge>
                              </TableCell>
                              <TableCell className="space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPostType(postType);
                                    setPostTypeDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => togglePostTypeStatus(postType)}
                                >
                                  <Power className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <PostTypeDialog
        open={postTypeDialogOpen}
        onOpenChange={setPostTypeDialogOpen}
        postType={selectedPostType}
        onSuccess={() => {
          refetchPostTypes();
          setPostTypeDialogOpen(false);
          setSelectedPostType(null);
        }}
      />

      <SocialPlatformDialog
        open={platformDialogOpen}
        onOpenChange={setPlatformDialogOpen}
        platform={selectedPlatform}
        onSuccess={() => {
          refetchPlatforms();
          setPlatformDialogOpen(false);
          setSelectedPlatform(null);
        }}
      />
    </div>
  );
}
