
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ControllerRenderProps } from "react-hook-form";

interface DateSelectorProps {
  field: ControllerRenderProps<any, any>;
  label: string;
}

export function DateSelector({ field, label }: DateSelectorProps) {
  const value = field.value ? new Date(field.value) : undefined;

  return (
    <FormItem className="flex flex-col">
      <FormLabel>{label}</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant={"outline"}
              className={cn(
                "w-full pl-3 text-left font-normal",
                !field.value && "text-muted-foreground"
              )}
              type="button"
            >
              {value ? (
                format(value, "dd/MM/yyyy")
              ) : (
                <span>Seleccione una fecha</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              if (date) {
                console.log('Fecha seleccionada antes de onChange:', date);
                field.onChange(date);
                console.log('Valor del campo después de onChange:', field.value);
              }
            }}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}
