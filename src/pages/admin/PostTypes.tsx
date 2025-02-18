
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
import { Plus, Edit, Power, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { PostTypeDialog } from "@/components/post-types/PostTypeDialog";
import { SocialPlatformDialog } from "@/components/post-types/SocialPlatformDialog";
import { CreatorRateDialog } from "@/components/post-types/CreatorRateDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import type { Database } from "@/integrations/supabase/types";

type SocialPlatform = Database["public"]["Tables"]["social_platforms"]["Row"];
type PostType = Database["public"]["Tables"]["post_types"]["Row"] & {
  social_platforms: Pick<SocialPlatform, "name">;
};

type CreatorRate = {
  id: string;
  creator_id: string;
  platform_id: string;
  post_type_id: string;
  rate_usd: number;
  created_at: string;
  profiles: {
    personal_data: {
      first_name: string | null;
      last_name: string | null;
      instagram_username: string | null;
    } | null;
  };
  social_platforms: {
    name: string;
  };
  post_types: {
    name: string;
  };
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
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState<PostType | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

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

  const { data: rates, refetch: refetchRates } = useQuery({
    queryKey: ["creatorRates", page, searchTerm],
    queryFn: async () => {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const query = supabase
        .from("creator_rates")
        .select(`
          *,
          profiles!creator_rates_creator_id_fkey (
            personal_data (
              first_name,
              last_name,
              instagram_username
            )
          ),
          social_platforms!creator_rates_platform_id_fkey (
            name
          ),
          post_types!creator_rates_post_type_id_fkey (
            name
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query.or(`profiles.personal_data.first_name.ilike.%${searchTerm}%,profiles.personal_data.last_name.ilike.%${searchTerm}%,profiles.personal_data.instagram_username.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;
      
      return {
        rates: data as CreatorRate[],
        totalPages: Math.ceil((count || 0) / itemsPerPage)
      };
    },
  });

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
            <TabsTrigger value="rates">Tarifas</TabsTrigger>
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

        <TabsContent value="rates">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Tarifas de Creadores</h2>
              <Button onClick={() => setRateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Tarifa
              </Button>
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Buscar por nombre o usuario de Instagram..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="max-w-sm"
              />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creador</TableHead>
                  <TableHead>Red Social</TableHead>
                  <TableHead>Tipo de Publicación</TableHead>
                  <TableHead>Tarifa (USD)</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates?.rates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>
                      {rate.profiles.personal_data?.first_name} {rate.profiles.personal_data?.last_name}
                      {rate.profiles.personal_data?.instagram_username && (
                        <span className="text-sm text-gray-500 block">
                          @{rate.profiles.personal_data.instagram_username}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{rate.social_platforms.name}</TableCell>
                    <TableCell>{rate.post_types.name}</TableCell>
                    <TableCell>${rate.rate_usd}</TableCell>
                    <TableCell>
                      {new Date(rate.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Implementar edición de tarifa
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {rates?.totalPages > 1 && (
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-3">
                  Página {page} de {rates.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.min(rates.totalPages, prev + 1))}
                  disabled={page === rates.totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
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

      <CreatorRateDialog
        open={rateDialogOpen}
        onOpenChange={setRateDialogOpen}
        onSuccess={() => {
          refetchRates();
          setRateDialogOpen(false);
        }}
      />
    </div>
  );
}
