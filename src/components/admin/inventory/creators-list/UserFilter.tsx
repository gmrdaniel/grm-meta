import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fetchAdminUsers } from "@/services/creatorService";
import { toast } from "sonner";
interface UserFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
}
export function UserFilter({
  value,
  onChange
}: UserFilterProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<{
    id: string;
    name: string;
    email: string;
  }[]>([]);
  const [loading, setLoading] = useState(false);

  // Get the selected user name for display
  const selectedUserName = value === null ? "Sin asignar" : users.find(user => user.name === value)?.name || value;
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
  const handleSelect = (selectedValue: string) => {
    if (selectedValue === "unassigned") {
      onChange("unassigned");
    } else {
      onChange(selectedValue);
    }
    setOpen(false);
  };
  return <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Buscar usuario..." />
          <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
          <CommandGroup>
            <CommandItem onSelect={() => handleSelect("unassigned")} className="text-sm" value="unassigned">
              <div className="flex items-center">
                {value === "unassigned" && <Check className="mr-2 h-4 w-4" />}
                <X className="mr-2 h-4 w-4" />
                <span>Sin asignar</span>
              </div>
            </CommandItem>
            {users.map(user => <CommandItem key={user.id} onSelect={() => handleSelect(user.name)} className="text-sm" value={user.name}>
                <div className="flex flex-col w-full">
                  <div className="flex items-center">
                    {value === user.name && <Check className="mr-2 h-4 w-4" />}
                    <User className="mr-2 h-4 w-4" />
                    <span>{user.name}</span>
                  </div>
                  {user.email && <span className="text-xs text-muted-foreground ml-8">
                      {user.email}
                    </span>}
                </div>
              </CommandItem>)}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>;
}