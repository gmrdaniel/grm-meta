
import { useEffect, useState } from "react";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  creator_id: z.string().min(1, "El creador es requerido"),
  platform_id: z.string().min(1, "La red social es requerida"),
  post_type_id: z.string().min(1, "El tipo de publicación es requerido"),
  rate_usd: z.coerce.number().min(0, "La tarifa debe ser mayor o igual a 0"),
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
  const [creatorSearch, setCreatorSearch] = useState("");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      creator_id: "",
      platform_id: "",
      post_type_id: "",
      rate_usd: 0,
    },
  });

  const { data: creators = [] } = useQuery({
    queryKey: ["creators", creatorSearch],
    queryFn: async () => {
      const query = supabase
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

      if (creatorSearch) {
        query.or(`personal_data.first_name.ilike.%${creatorSearch}%,personal_data.last_name.ilike.%${creatorSearch}%,personal_data.instagram_username.ilike.%${creatorSearch}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Creator[];
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
      return data;
    },
  });

  const { data: postTypes = [] } = useQuery({
    queryKey: ["postTypes", form.watch("platform_id")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_types")
        .select("*")
        .eq("platform_id", form.watch("platform_id"))
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!form.watch("platform_id"),
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
          .match({
            creator_id: values.creator_id,
            platform_id: values.platform_id,
            post_type_id: values.post_type_id,
          });

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
          <DialogTitle>Nueva Tarifa</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="creator_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Creador</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? creators.find((creator) => creator.id === field.value)
                                ?.personal_data?.first_name
                            : "Seleccionar creador"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Buscar creador..."
                          onValueChange={setCreatorSearch}
                        />
                        <CommandEmpty>No se encontraron creadores.</CommandEmpty>
                        <CommandGroup>
                          {creators.map((creator) => (
                            <CommandItem
                              value={creator.id}
                              key={creator.id}
                              onSelect={() => {
                                form.setValue("creator_id", creator.id);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  creator.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {creator.personal_data?.first_name}{" "}
                              {creator.personal_data?.last_name}
                              {creator.personal_data?.instagram_username && (
                                <span className="ml-2 text-sm text-muted-foreground">
                                  @{creator.personal_data.instagram_username}
                                </span>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        form.setValue("post_type_id", "");
                      }}
                    >
                      <option value="">Seleccionar red social</option>
                      {platforms.map((platform) => (
                        <option key={platform.id} value={platform.id}>
                          {platform.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
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
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                      disabled={!form.watch("platform_id")}
                    >
                      <option value="">
                        {form.watch("platform_id")
                          ? "Seleccionar tipo de publicación"
                          : "Primero selecciona una red social"}
                      </option>
                      {postTypes.map((postType) => (
                        <option key={postType.id} value={postType.id}>
                          {postType.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
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
                      placeholder="0.00"
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
