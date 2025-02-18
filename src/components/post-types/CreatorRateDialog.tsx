import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Creator {
  id: string;
  personal_data?: {
    first_name: string | null;
    last_name: string | null;
    instagram_username: string | null;
  };
}

const creatorRateFormSchema = z.object({
  creatorId: z.string().min(1, { message: "Please select a creator." }),
  rate: z.number({ invalid_type_error: "Please enter a valid rate." }).min(0, {
    message: "Rate must be a positive number.",
  }),
});

interface CreatorRateDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  platformId: string;
  postTypeId: string;
  onRateCreated: () => void;
}

export function CreatorRateDialog({
  open,
  setOpen,
  platformId,
  postTypeId,
  onRateCreated,
}: CreatorRateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creatorSearch, setCreatorSearch] = useState("");

  const { data: creators = [] } = useQuery({
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
      return data as Creator[];
    },
  });

  const form = useForm<z.infer<typeof creatorRateFormSchema>>({
    resolver: zodResolver(creatorRateFormSchema),
    defaultValues: {
      creatorId: "",
      rate: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof creatorRateFormSchema>) {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("creator_rates").insert({
        profile_id: values.creatorId,
        platform_id: platformId,
        post_type_id: postTypeId,
        rate: values.rate,
      });

      if (error) {
        throw error;
      }

      toast.success("Creator rate created successfully!");
      form.reset();
      onRateCreated();
      setOpen(false);
    } catch (error: any) {
      toast.error(`Failed to create creator rate. ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Creator Rate</DialogTitle>
          <DialogDescription>
            Create a new rate for a specific creator, platform, and post type.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="creatorId">Creator</Label>
              <Input
                type="search"
                placeholder="Search creator..."
                onChange={(e) => setCreatorSearch(e.target.value)}
              />
              <FormField
                control={form.control}
                name="creatorId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a creator" />
                        </SelectTrigger>
                        <SelectContent>
                          {creators.map((creator) => (
                            <SelectItem key={creator.id} value={creator.id}>
                              {creator.personal_data?.first_name}{" "}
                              {creator.personal_data?.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Create Rate"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
