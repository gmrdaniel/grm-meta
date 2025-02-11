
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type UseFormReturn } from "react-hook-form";
import { type BankDetailsFormValues } from "@/lib/schemas/bank-details";

interface BankTransferFieldsProps {
  form: UseFormReturn<BankDetailsFormValues>;
  country: string;
}

export function BankTransferFields({ form, country }: BankTransferFieldsProps) {
  switch (country) {
    case "Estados Unidos de América":
      return (
        <>
          <FormField
            control={form.control}
            name="routing_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código ABA (número de ruta)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bank_account_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de cuenta bancaria</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      );

    case "México":
      return (
        <FormField
          control={form.control}
          name="clabe"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CLABE (18 dígitos)</FormLabel>
              <FormControl>
                <Input {...field} maxLength={18} />
              </FormControl>
              <FormDescription>
                Clave Bancaria Estandarizada de 18 dígitos
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "Reino Unido":
      return (
        <FormField
          control={form.control}
          name="iban"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IBAN</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    default:
      return (
        <>
          <FormField
            control={form.control}
            name="bank_account_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de cuenta bancaria</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="swift_bic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código SWIFT/BIC</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      );
  }
}
