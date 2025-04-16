
import { useState } from "react";
import { Check, ChevronsUpDown, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const specificUsers = [
  "DANIEL", "ORIANA", "FRANK", "ANA", 
  "MANUEL", "DAYANA", "KATHERINE", "SAONE"
];

interface UserFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function UserFilter({
  value,
  onChange
}: UserFilterProps) {
  const [open, setOpen] = useState(false);
  const [loading] = useState(false);

  // Get the selected user name directly from specificUsers or default text
  const selectedUserName = value === null ? "Sin usuario asignado" : value;
  
  const handleSelect = (selectedValue: string) => {
    if (selectedValue === "unassigned") {
      onChange(null);
      toast.success("Filtro establecido: Sin usuario asignado");
    } else {
      onChange(selectedValue);
      toast.success(`Filtro establecido: ${selectedValue}`);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          className="flex items-center gap-1"
          disabled={loading}
        >
          <User className="h-4 w-4" />
          Usuario asignado
          {value !== null && (
            <Badge className="ml-1 bg-primary text-primary-foreground" variant="default">
              {selectedUserName}
            </Badge>
          )}
          {value === null && (
            <Badge className="ml-1" variant="outline">
              Sin asignar
            </Badge>
          )}
          <ChevronsUpDown className="h-4 w-4 ml-1 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Buscar usuario..." />
          <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
          <CommandGroup>
            <CommandItem onSelect={() => handleSelect("unassigned")} className="text-sm" value="unassigned">
              <div className="flex items-center">
                {value === null && <Check className="mr-2 h-4 w-4" />}
                <X className="mr-2 h-4 w-4" />
                <span>Sin usuario asignado</span>
              </div>
            </CommandItem>
            {specificUsers.map(name => (
              <CommandItem key={name} onSelect={() => handleSelect(name)} className="text-sm" value={name}>
                <div className="flex items-center">
                  {value === name && <Check className="mr-2 h-4 w-4" />}
                  <User className="mr-2 h-4 w-4" />
                  <span>{name}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
