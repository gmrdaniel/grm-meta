
import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { PaymentFormValues } from "./PaymentFormSchema";

interface PaymentStatusFieldsProps {
  form: UseFormReturn<PaymentFormValues>;
}

export function PaymentStatusFields({ form }: PaymentStatusFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="brand_payment_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado Pago Marca</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="pagado">Pagado</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="creator_payment_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado Pago Creador</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="pagado">Pagado</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="brand_payment_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha Pago Marca</FormLabel>
              <DatePicker
                value={field.value}
                onChange={field.onChange}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="creator_payment_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha Pago Creador</FormLabel>
              <DatePicker
                value={field.value}
                onChange={field.onChange}
              />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
