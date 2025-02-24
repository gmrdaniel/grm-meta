
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
import { DollarSign } from "lucide-react";

const formSchema = z.object({
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
  email: string;
  full_name: string | null;
}

interface CreatorRateFormProps {
  selectedCreator: Creator | null;
  onSuccess: () => void;
}

export function CreatorRateForm({ selectedCreator, onSuccess }: CreatorRateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      post_type_id: "",
      rate_usd: "",
    },
  });

  const { data: postTypes = [] } = useQuery({
    queryKey: ["post-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_types")
        .select(`
          id,
          name,
          social_platforms(
            name
          )
        `)
        .eq("status", "active");

      if (error) throw error;
      return data;
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedCreator) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("creator_rates")
        .insert([{
          profile_id: selectedCreator.id,
          post_type_id: values.post_type_id,
          rate_usd: parseFloat(values.rate_usd),
        }]);

      if (error) {
        if (error.code === "23505") {
          toast.error("Ya existe una tarifa para este creador y tipo de publicación");
        } else {
          toast.error("Error al guardar la tarifa");
        }
        console.error("Error:", error);
        return;
      }

      toast.success("Tarifa creada correctamente");
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar la tarifa");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!selectedCreator) return null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
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
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ingresa la tarifa"
                    className="pl-8"
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          Crear Tarifa
        </Button>
      </form>
    </Form>
  );
}
