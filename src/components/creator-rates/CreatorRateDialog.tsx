
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  profile_id: z.string().min(1, "El creador es requerido"),
  post_type_id: z.string().min(1, "El tipo de publicación es requerido"),
  rate_usd: z.string().refine(
    (value) => {
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0;
    },
    {
      message: "La tarifa debe ser un número mayor o igual a 0",
    }
  ),
});

interface Creator {
  id: string;
  personal_data: {
    first_name: string;
    last_name: string;
  };
}

interface PostType {
  id: string;
  name: string;
  social_platforms: {
    name: string;
  };
}

interface CreatorRateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rate: any | null;
  onSuccess: () => void;
}

export function CreatorRateDialog({
  open,
  onOpenChange,
  rate,
  onSuccess,
}: CreatorRateDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profile_id: "",
      post_type_id: "",
      rate_usd: "",
    },
  });

  const { data: creators = [] } = useQuery({
    queryKey: ["creators"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          id,
          personal_data (
            first_name,
            last_name
          )
        `
        )
        .eq("role", "creator");

      if (error) throw error;
      return data as Creator[];
    },
  });

  const { data: postTypes = [] } = useQuery({
    queryKey: ["post-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_types")
        .select(
          `
          id,
          name,
          social_platforms (
            name
          )
        `
        )
        .eq("status", "active");

      if (error) throw error;
      return data as PostType[];
    },
  });

  useEffect(() => {
    if (rate) {
      form.reset({
        profile_id: rate.profile_id,
        post_type_id: rate.post_type_id,
        rate_usd: rate.rate_usd.toString(),
      });
    } else {
      form.reset({
        profile_id: "",
        post_type_id: "",
        rate_usd: "",
      });
    }
  }, [rate, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const payload = {
        profile_id: values.profile_id,
        post_type_id: values.post_type_id,
        rate_usd: parseFloat(values.rate_usd),
      };

      if (rate) {
        const { error } = await supabase
          .from("creator_rates")
          .update(payload)
          .eq("id", rate.id);

        if (error) throw error;
        toast.success("Tarifa actualizada correctamente");
      } else {
        const { error } = await supabase
          .from("creator_rates")
          .insert([payload]);

        if (error) throw error;
        toast.success("Tarifa creada correctamente");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error.message === "duplicate key value violates unique constraint"
          ? "Ya existe una tarifa para este creador y tipo de publicación"
          : "Error al guardar la tarifa"
      );
      console.error("Error:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {rate ? "Editar" : "Nueva"} Tarifa de Creador
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="profile_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Creador</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!rate}
                  >
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
              name="post_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Publicación</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!rate}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {postTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.social_platforms?.name} - {type.name}
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
                      step="0.01"
                      min="0"
                      placeholder="Ingresa la tarifa"
                      {...field}
                    />
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
