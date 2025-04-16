
import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, User, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { fetchAdminUsers } from "@/services/creatorService";
import { toast } from "sonner";

interface UserFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function UserFilter({ value, onChange }: UserFilterProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  
  const selectedUserName = !value 
    ? "Todos los usuarios" 
    : value === "unassigned" 
      ? "Sin asignar" 
      : users.find(user => user.id === value)?.name || "Usuario seleccionado";

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const adminUsers = await fetchAdminUsers();
        setUsers(adminUsers);
      } catch (error) {
        console.error("Error loading admin users:", error);
        toast.error("Error al cargar los usuarios administradores");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleSelect = (selectedValue: string | null) => {
    onChange(selectedValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[230px] justify-between"
          disabled={loading}
        >
          {value ? (
            value === "unassigned" ? (
              <X className="mr-2 h-4 w-4" />
            ) : (
              <User className="mr-2 h-4 w-4" />
            )
          ) : (
            <Users className="mr-2 h-4 w-4" />
          )}
          {loading ? "Cargando..." : selectedUserName}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[230px] p-0">
        <Command>
          <CommandInput placeholder="Buscar usuario..." />
          <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              onSelect={() => handleSelect(null)}
              className="text-sm"
            >
              <div className="flex items-center">
                {!value && <Check className="mr-2 h-4 w-4" />}
                <Users className="mr-2 h-4 w-4" />
                <span>Todos los usuarios</span>
              </div>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("unassigned")}
              className="text-sm"
            >
              <div className="flex items-center">
                {value === "unassigned" && <Check className="mr-2 h-4 w-4" />}
                <X className="mr-2 h-4 w-4" />
                <span>Sin asignar</span>
              </div>
            </CommandItem>
            {users.map((user) => (
              <CommandItem
                key={user.id}
                onSelect={() => handleSelect(user.id)}
                className="text-sm"
              >
                <div className="flex items-center">
                  {value === user.id && <Check className="mr-2 h-4 w-4" />}
                  <User className="mr-2 h-4 w-4" />
                  <span>{user.name}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
