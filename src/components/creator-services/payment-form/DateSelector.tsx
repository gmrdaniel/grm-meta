
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
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      field.onChange(date);
    }
  };

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
              {field.value ? (
                format(new Date(field.value), "dd/MM/yyyy")
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
            selected={field.value ? new Date(field.value) : undefined}
            onSelect={handleSelect}
            initialFocus
            disabled={false}
            captionLayout="dropdown-buttons"
            fromYear={2000}
            toYear={2100}
            showOutsideDays={true}
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}
