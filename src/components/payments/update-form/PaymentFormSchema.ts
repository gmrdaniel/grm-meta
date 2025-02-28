
import { z } from "zod";

export const paymentSchema = z.object({
  total_amount: z.number().min(0),
  company_earning: z.number().min(0),
  creator_earning: z.number().min(0),
  brand_payment_status: z.string(),
  creator_payment_status: z.string(),
  brand_payment_date: z.date().nullable(),
  creator_payment_date: z.date().nullable(),
  payment_receipt: z.instanceof(File).optional(),
  payment_month: z.date().nullable()
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

// Define the expected values for audit logs
export const AUDIT_MODULE = "payments";
export const AUDIT_TABLE_NAME = "service_payments";
export const AUDIT_ACTION_TYPE = "payment" as const;
