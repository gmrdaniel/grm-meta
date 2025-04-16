
import { useState } from "react";
import { Check, ChevronsUpDown, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [users] = useState(specificUsers.map(name => ({
    id: name,
    name: name,
    email: `${name.toLowerCase()}@example.com`
  })));

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
          role="combobox"
          aria-expanded={open}
          className="w-[180px] justify-between"
          disabled={loading}
        >
          {loading ? (
            "Cargando usuarios..."
          ) : (
            <>
              <User className="mr-2 h-4 w-4" />
              <span className="truncate">{selectedUserName}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </>
          )}
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
            {users.map(user => (
              <CommandItem key={user.id} onSelect={() => handleSelect(user.name)} className="text-sm" value={user.name}>
                <div className="flex flex-col w-full">
                  <div className="flex items-center">
                    {value === user.name && <Check className="mr-2 h-4 w-4" />}
                    <User className="mr-2 h-4 w-4" />
                    <span>{user.name}</span>
                  </div>
                  {user.email && (
                    <span className="text-xs text-muted-foreground ml-8">
                      {user.email}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
