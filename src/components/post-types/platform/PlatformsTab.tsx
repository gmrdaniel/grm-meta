
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PlatformsTable } from "./PlatformsTable";
import { SocialPlatformDialog } from "@/components/post-types/SocialPlatformDialog";
import type { Database } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type SocialPlatform = Database["public"]["Tables"]["social_platforms"]["Row"];

export function PlatformsTab() {
  const [platformDialogOpen, setPlatformDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(
    null
  );

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Redes Sociales</h2>
        <Button onClick={() => setPlatformDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Red Social
        </Button>
      </div>

      <PlatformsTable
        platforms={platforms}
        onEdit={(platform) => {
          setSelectedPlatform(platform);
          setPlatformDialogOpen(true);
        }}
        refetchPlatforms={refetchPlatforms}
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
