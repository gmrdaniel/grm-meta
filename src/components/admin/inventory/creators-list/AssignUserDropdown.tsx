
import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, UserPlus, X } from "lucide-react";
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
import { fetchAdminUsers, assignCreatorToUser } from "@/services/creatorService";
import { toast } from "sonner";

interface AssignUserDropdownProps {
  creatorId: string;
  currentUserId: string | null;
  onSuccess: () => void;
  showIcon?: boolean;
}

export function AssignUserDropdown({ 
  creatorId, 
  currentUserId, 
  onSuccess,
  showIcon = true
}: AssignUserDropdownProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(currentUserId || "");
  const [loadingAssign, setLoadingAssign] = useState(false);
  
  const currentUserName = currentUserId 
    ? currentUserId 
    : "Sin asignar";

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        // Define the specific users we want to display
        const specificUsers = [
          "DANIEL", "ORIANA", "FRANK", "ANA", 
          "MANUEL", "DAYANA", "KATHERINE", "SAONE"
        ];
        
        // Create hardcoded user list
        const hardcodedUsers = specificUsers.map(name => ({
          id: name,
          name: name,
          email: `${name.toLowerCase()}@example.com` // Placeholder emails
        }));
        
        setUsers(hardcodedUsers);
      } catch (error) {
        console.error("Error loading admin users:", error);
        toast.error("Error al cargar los usuarios administradores");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleAssign = async (userName: string | null) => {
    setLoadingAssign(true);
    try {
      await assignCreatorToUser(creatorId, userName);
      setValue(userName || "");
      toast.success(userName ? "Creador asignado correctamente" : "Asignación eliminada");
      onSuccess();
    } catch (error) {
      console.error("Error assigning creator:", error);
      toast.error("Error al asignar creador");
    } finally {
      setLoadingAssign(false);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between",
            showIcon ? "w-[200px]" : "w-[150px]"
          )}
          disabled={loading || loadingAssign}
        >
          {showIcon && value ? (
            <UserPlus className="mr-2 h-4 w-4 shrink-0" />
          ) : null}
          {loading ? "Cargando..." : currentUserName}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Buscar usuario..." />
          <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              onSelect={() => handleAssign(null)}
              className="text-sm"
              value="unassigned"
            >
              <div className="flex items-center">
                {!value && <Check className="mr-2 h-4 w-4" />}
                <X className="mr-2 h-4 w-4" />
                <span>Sin asignar</span>
              </div>
            </CommandItem>
            {users.map((user) => (
              <CommandItem
                key={user.id}
                onSelect={() => handleAssign(user.name)}
                className="text-sm"
                value={user.name}
              >
                <div className="flex flex-col w-full">
                  <div className="flex items-center">
                    {value === user.name && <Check className="mr-2 h-4 w-4" />}
                    <UserPlus className="mr-2 h-4 w-4" />
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
