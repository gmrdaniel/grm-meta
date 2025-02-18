
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type PostType = Database["public"]["Tables"]["post_types"]["Row"] & {
  social_platforms: Pick<SocialPlatform, "name">;
};
type SocialPlatform = Database["public"]["Tables"]["social_platforms"]["Row"];

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  platform_id: z.string().min(1, "La red social es requerida"),
});

interface PostTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postType: PostType | null;
  onSuccess: () => void;
}

export function PostTypeDialog({
  open,
  onOpenChange,
  postType,
  onSuccess,
}: PostTypeDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      platform_id: "",
    },
  });

  const { data: platforms = [] } = useQuery({
    queryKey: ["platforms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_platforms")
        .select("*")
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      return data as SocialPlatform[];
    },
  });

  useEffect(() => {
    if (postType) {
      form.reset({
        name: postType.name,
        platform_id: postType.platform_id,
      });
    } else {
      form.reset({
        name: "",
        platform_id: "",
      });
    }
  }, [postType, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (postType) {
        const { error } = await supabase
          .from("post_types")
          .update({
            name: values.name,
            platform_id: values.platform_id,
          })
          .eq("id", postType.id);

        if (error) throw error;
        toast.success("Tipo de publicación actualizado correctamente");
      } else {
        const { error } = await supabase.from("post_types").insert({
          name: values.name,
          platform_id: values.platform_id,
        });

        if (error) throw error;
        toast.success("Tipo de publicación creado correctamente");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error.message === "duplicate key value violates unique constraint"
          ? "Ya existe un tipo de publicación con ese nombre para la red social seleccionada"
          : "Error al guardar el tipo de publicación"
      );
      console.error("Error:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {postType ? "Editar" : "Nuevo"} Tipo de Publicación
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="platform_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Red Social</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una red social" />
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del tipo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
