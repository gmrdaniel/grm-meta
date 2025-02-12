
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["único", "recurrente", "contrato"]),
  company_share_min: z.number().min(0).max(100),
  company_share_max: z.number().min(0).max(100),
  fixed_fee: z.number().min(0),
  max_revenue: z.number().optional().nullable(),
  contract_duration: z.number().optional().nullable(),
  renewable: z.boolean().default(false),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  initialData?: Partial<ServiceFormValues>;
  onSubmit: (data: ServiceFormValues) => void;
  isLoading?: boolean;
}

export function ServiceForm({ initialData, onSubmit, isLoading }: ServiceFormProps) {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      type: initialData?.type || "único",
      company_share_min: initialData?.company_share_min || 0,
      company_share_max: initialData?.company_share_max || 0,
      fixed_fee: initialData?.fixed_fee || 0,
      max_revenue: initialData?.max_revenue || null,
      contract_duration: initialData?.contract_duration || null,
      renewable: initialData?.renewable || false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="único">Único</SelectItem>
                  <SelectItem value="recurrente">Recurrente</SelectItem>
                  <SelectItem value="contrato">Contrato</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="company_share_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Company Share (%)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company_share_max"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Company Share (%)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="fixed_fee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fixed Fee ($)</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="max_revenue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Revenue ($)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contract_duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contract Duration (months)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="renewable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Renewable</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Service"}
        </Button>
      </form>
    </Form>
  );
}
