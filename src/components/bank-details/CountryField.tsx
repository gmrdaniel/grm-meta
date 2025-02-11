
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Country } from "@/services/countryService";
import { type UseFormReturn } from "react-hook-form";
import { type BankDetailsFormValues } from "@/lib/schemas/bank-details";

interface CountryFieldProps {
  form: UseFormReturn<BankDetailsFormValues>;
  countries: Country[];
  isLoadingCountries: boolean;
}

export function CountryField({ form, countries, isLoadingCountries }: CountryFieldProps) {
  return (
    <FormField
      control={form.control}
      name="country"
      render={({ field }) => (
        <FormItem>
          <FormLabel>País de destino</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
            disabled={isLoadingCountries}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un país" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.name_es}>
                  {country.name_es}
                </SelectItem>
              ))}
              <SelectItem value="Otro">Otro</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
