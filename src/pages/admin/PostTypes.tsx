
import { useEffect, useState } from "react";
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
import type { Database } from "@/integrations/supabase/types";

type SocialPlatform = Database["public"]["Tables"]["social_platforms"]["Row"];
type PostType = Database["public"]["Tables"]["post_types"]["Row"] & {
  social_platforms: Pick<SocialPlatform, "name">;
};

export default function PostTypes() {
  const [postTypes, setPostTypes] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState<PostType | null>(null);

  useEffect(() => {
    fetchPostTypes();
  }, []);

  async function fetchPostTypes() {
    try {
      const { data, error } = await supabase
        .from("post_types")
        .select(`
          *,
          social_platforms (
            name
          )
        `)
        .order("name");

      if (error) throw error;
      setPostTypes(data);
    } catch (error: any) {
      toast.error("Error al cargar los tipos de publicación");
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusToggle(postType: PostType) {
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
      fetchPostTypes();
    } catch (error: any) {
      toast.error("Error al actualizar el estado");
      console.error("Error:", error.message);
    }
  }

  function handleEdit(postType: PostType) {
    setSelectedPostType(postType);
    setDialogOpen(true);
  }

  function handleCreate() {
    setSelectedPostType(null);
    setDialogOpen(true);
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tipos de Publicación</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Tipo
        </Button>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Red Social</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {postTypes.map((postType) => (
              <TableRow key={postType.id}>
                <TableCell>{postType.name}</TableCell>
                <TableCell>{postType.social_platforms.name}</TableCell>
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
                      onClick={() => handleEdit(postType)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleStatusToggle(postType)}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <PostTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        postType={selectedPostType}
        onSuccess={fetchPostTypes}
      />
    </div>
  );
}
