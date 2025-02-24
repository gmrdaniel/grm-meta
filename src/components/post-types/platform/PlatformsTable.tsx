
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

interface PlatformsTableProps {
  platforms: SocialPlatform[];
  onEdit: (platform: SocialPlatform) => void;
  refetchPlatforms: () => void;
}

export function PlatformsTable({
  platforms,
  onEdit,
  refetchPlatforms,
}: PlatformsTableProps) {
  const togglePlatformStatus = async (platform: SocialPlatform) => {
    try {
      const { error } = await supabase
        .from("social_platforms")
        .update({ status: platform.status === "active" ? "inactive" : "active" })
        .eq("id", platform.id);

      if (error) throw error;

      toast.success("Estado actualizado correctamente");
      refetchPlatforms();
    } catch (error) {
      toast.error("Error al actualizar el estado");
      console.error(error);
    }
  };

  return (
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
                onClick={() => onEdit(platform)}
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
  );
}
