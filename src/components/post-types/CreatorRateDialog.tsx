import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

const formSchema = z.object({
  creator_id: z.string().min(1, {
    message: "Debes seleccionar un creador.",
  }),
  platform_id: z.string().min(1, {
    message: "Debes seleccionar una plataforma.",
  }),
  post_type_id: z.string().min(1, {
    message: "Debes seleccionar un tipo de publicación.",
  }),
  rate_usd: z.string().refine((value) => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  }, {
    message: "La tarifa debe ser un número mayor que cero.",
  }),
});

interface CreatorRateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Creator = {
  id: string;
  personal_data: {
    first_name: string | null;
    last_name: string | null;
    instagram_username: string | null;
  } | null;
};

export function CreatorRateDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreatorRateDialogProps) {
  const [creators, setCreators] = useState<Creator[]>([]);

  useEffect(() => {
    const fetchCreators = async () => {
      try {
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
        setCreators(data as Creator[]);
      } catch (error: any) {
        toast.error("Error fetching creators");
        console.error("Error:", error.message);
      }
    };

    fetchCreators();
  }, []);

  const { data: platforms = [] } = useQuery({
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

  const { data: postTypes = [] } = useQuery({
    queryKey: ["postTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_types")
        .select("*")
        .order("created_at");

      if (error) throw error;
      return data;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      creator_id: "",
      platform_id: "",
      post_type_id: "",
      rate_usd: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data: existingRate, error: checkError } = await supabase
        .from("creator_rates")
        .select()
        .match({
          creator_id: values.creator_id,
          platform_id: values.platform_id,
          post_type_id: values.post_type_id,
        });

      if (checkError) throw checkError;

      if (existingRate && existingRate.length > 0) {
        const { error } = await supabase
          .from("creator_rates")
          .update({ rate_usd: values.rate_usd })
          .eq("id", existingRate[0].id);

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nueva Tarifa de Creador</DialogTitle>
          <DialogDescription>
            Asigna una tarifa específica para un creador, plataforma y tipo de
            publicación.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="creator_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Creador</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un creador" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {creators.map((creator) => (
                        <SelectItem key={creator.id} value={creator.id}>
                          {creator.personal_data?.first_name}{" "}
                          {creator.personal_data?.last_name}
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
                  <FormLabel>Plataforma</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una plataforma" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {platforms.map((platform: any) => (
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {postTypes.map((postType: any) => (
                        <SelectItem key={postType.id} value={postType.id}>
                          {postType.name}
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
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Guardar Tarifa</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
