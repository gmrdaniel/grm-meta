
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { BasicInfoFields } from "./form-sections/BasicInfoFields";
import { TermsConditionsField } from "./form-sections/TermsConditionsField";
import { ServiceTypeField } from "./form-sections/ServiceTypeField";
import { CompanyShareFields } from "./form-sections/CompanyShareFields";
import { FeesAndDurationFields } from "./form-sections/FeesAndDurationFields";
import { RenewableField } from "./form-sections/RenewableField";

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
  terms_conditions: z.string().optional(),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;

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
      terms_conditions: initialData?.terms_conditions || "# Terms and Conditions\n\nEnter the terms and conditions here...",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInfoFields form={form} />
        <TermsConditionsField form={form} />
        <ServiceTypeField form={form} />
        <CompanyShareFields form={form} />
        <FeesAndDurationFields form={form} />
        <RenewableField form={form} />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Service"}
        </Button>
      </form>
    </Form>
  );
}
