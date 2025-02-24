
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Power } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

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

interface PostTypesTableProps {
  postTypes: PostType[];
  onEdit: (postType: PostType) => void;
  refetchPostTypes: () => void;
}

export function PostTypesTable({
  postTypes,
  onEdit,
  refetchPostTypes,
}: PostTypesTableProps) {
  const groupedPostTypes = groupPostTypesBySocialPlatform(postTypes);

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
    <>
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
                      variant={postType.status === "active" ? "default" : "secondary"}
                    >
                      {postType.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(postType)}
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
    </>
  );
}
