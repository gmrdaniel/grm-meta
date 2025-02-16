
import * as z from "zod";

export const paymentFormSchema = z.object({
  total_amount: z.number().min(0, "El monto total debe ser mayor o igual a 0"),
  company_earning: z.number().min(0, "El monto de la empresa debe ser mayor o igual a 0"),
  creator_earning: z.number().min(0, "El monto del creador debe ser mayor o igual a 0"),
  brand_payment_status: z.enum(["pendiente", "pagado", "atrasado"]),
  creator_payment_status: z.enum(["pendiente", "pagado", "atrasado"]),
  brand_payment_date: z.date().nullable(),
  creator_payment_date: z.date().nullable(),
  payment_receipt: z.instanceof(File).optional(),
  payment_month: z.date().nullable(),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
