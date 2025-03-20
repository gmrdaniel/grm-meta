
import { z } from "zod";
import { Service } from "@/types/services";

export interface ServiceFormProps {
  defaultValues?: Partial<Service>;
  onSubmit: (data: Omit<Service, "id">) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const serviceFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  type: z.string().min(1, "Service type is required"),
  fixed_fee: z.number().optional(),
  company_share_min: z.number().min(0).max(100).optional(),
  company_share_max: z.number().min(0).max(100).optional(),
  contract_duration: z.number().optional(),
  max_revenue: z.number().optional(),
  renewable: z.boolean().optional(),
  terms_conditions: z.string().optional(),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export default function ServiceForm() {
  return null; // Placeholder component - the actual implementation is handled elsewhere
}
