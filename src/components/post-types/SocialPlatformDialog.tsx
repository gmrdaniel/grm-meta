
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SocialPlatform = Database["public"]["Tables"]["social_platforms"]["Row"];

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

interface SocialPlatformDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: SocialPlatform | null;
  onSuccess: () => void;
}

export function SocialPlatformDialog({
  open,
  onOpenChange,
  platform,
  onSuccess,
}: SocialPlatformDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (platform) {
      form.reset({
        name: platform.name,
      });
    } else {
      form.reset({
        name: "",
      });
    }
  }, [platform, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (platform) {
        const { error } = await supabase
          .from("social_platforms")
          .update({
            name: values.name,
          })
          .eq("id", platform.id);

        if (error) throw error;
        toast.success("Red social actualizada correctamente");
      } else {
        const { error } = await supabase.from("social_platforms").insert({
          name: values.name,
        });

        if (error) throw error;
        toast.success("Red social creada correctamente");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error.message === "duplicate key value violates unique constraint"
          ? "Ya existe una red social con ese nombre"
          : "Error al guardar la red social"
      );
      console.error("Error:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {platform ? "Editar" : "Nueva"} Red Social
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la red social" {...field} />
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
