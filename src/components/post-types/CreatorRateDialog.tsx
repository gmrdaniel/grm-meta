
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface CreatorRateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Creator {
  id: string;
  personal_data?: {
    first_name: string | null;
    last_name: string | null;
    instagram_username: string | null;
  } | null;
}

interface Platform {
  id: string;
  name: string;
  status: string;
}

interface PostType {
  id: string;
  name: string;
  status: string;
  platform_id: string;
}

const formSchema = z.object({
  creator_id: z.string().min(1, "Seleccione un creador"),
  platform_id: z.string().min(1, "Seleccione una red social"),
  post_type_id: z.string().min(1, "Seleccione un tipo de publicación"),
  rate_usd: z.number().min(0, "La tarifa debe ser mayor o igual a 0"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreatorRateDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreatorRateDialogProps) {
  const [creatorSearch] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      creator_id: "",
      platform_id: "",
      post_type_id: "",
      rate_usd: 0,
    },
  });

  const { data: creators = [] } = useQuery<Creator[]>({
    queryKey: ["creators", creatorSearch],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          personal_data (
            first_name,
            last_name,
            instagram_username
          )
        `)
        .eq("role", "creator");

      if (error) throw error;
      return data || [];
    },
  });

  const { data: platforms = [] } = useQuery<Platform[]>({
    queryKey: ["platforms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_platforms")
        .select("id, name, status")
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  const { data: postTypes = [] } = useQuery<PostType[]>({
    queryKey: ["postTypes", form.watch("platform_id")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_types")
        .select("id, name, status, platform_id")
        .eq("platform_id", form.watch("platform_id"))
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: Boolean(form.watch("platform_id")),
  });

  async function onSubmit(values: FormValues) {
    try {
      const { data: existingRate, error: checkError } = await supabase
        .from("creator_rates")
        .select("id")
        .match({
          creator_id: values.creator_id,
          platform_id: values.platform_id,
          post_type_id: values.post_type_id,
        })
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existingRate?.id) {
        const { error } = await supabase
          .from("creator_rates")
          .update({ rate_usd: values.rate_usd })
          .eq("id", existingRate.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("creator_rates")
          .insert({
            creator_id: values.creator_id,
            platform_id: values.platform_id,
            post_type_id: values.post_type_id,
            rate_usd: values.rate_usd,
          });

        if (error) throw error;
      }

      toast.success("Tarifa guardada correctamente");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Error al guardar la tarifa");
      console.error("Error:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Tarifa</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="creator_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Creador</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un creador" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {creators.map((creator) => (
                        <SelectItem key={creator.id} value={creator.id}>
                          {creator.personal_data?.first_name}{" "}
                          {creator.personal_data?.last_name}
                          {creator.personal_data?.instagram_username && (
                            <span className="text-gray-500">
                              {" "}
                              (@{creator.personal_data.instagram_username})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platform_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Red Social</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("post_type_id", "");
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una red social" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {platforms.map((platform) => (
                        <SelectItem key={platform.id} value={platform.id}>
                          {platform.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="post_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Publicación</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!form.watch("platform_id")}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {postTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rate_usd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarifa (USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
