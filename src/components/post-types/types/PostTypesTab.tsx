
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PostTypesTable } from "./PostTypesTable";
import { PostTypeDialog } from "@/components/post-types/PostTypeDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SocialPlatform = Database["public"]["Tables"]["social_platforms"]["Row"];
type PostType = Database["public"]["Tables"]["post_types"]["Row"] & {
  social_platforms: Pick<SocialPlatform, "name">;
};

export function PostTypesTab() {
  const [postTypeDialogOpen, setPostTypeDialogOpen] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState<PostType | null>(null);

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tipos de Publicación</h2>
        <Button onClick={() => setPostTypeDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Tipo
        </Button>
      </div>

      <PostTypesTable
        postTypes={postTypes}
        onEdit={(postType) => {
          setSelectedPostType(postType);
          setPostTypeDialogOpen(true);
        }}
        refetchPostTypes={refetchPostTypes}
      />

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
    </div>
  );
}
