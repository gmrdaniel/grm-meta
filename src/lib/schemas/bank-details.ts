
import { z } from "zod";
import { SUPPORTED_COUNTRIES } from "../constants";

export const bankDetailsSchema = z.object({
  country: z.string().min(1, "El país es requerido"),
  country_id: z.string().uuid().min(1, "El ID del país es requerido"),
  payment_method: z.enum(["bank_transfer", "paypal"]).default("bank_transfer"),
  beneficiary_name: z.string().min(1, "El nombre del beneficiario es requerido"),
  // Bank transfer fields
  bank_account_number: z.string().optional(),
  iban: z.string().optional(),
  swift_bic: z.string().optional(),
  bank_name: z.string().optional(),
  bank_address: z.string().optional(),
  routing_number: z.string().optional(),
  clabe: z.string().optional(),
  // PayPal fields
  paypal_email: z.string().email().optional(),
});

export type BankDetailsFormValues = z.infer<typeof bankDetailsSchema>;
