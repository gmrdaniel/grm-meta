
import { Mail } from "lucide-react";
import { Creator } from "@/types/creator";

interface CreatorBasicInfoProps {
  creator: Creator;
}

export function CreatorBasicInfo({ creator }: CreatorBasicInfoProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
        {getInitials(creator.nombre, creator.apellido)}
      </div>
      <div>
        <div className="font-medium">{creator.nombre} {creator.apellido}</div>
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <Mail className="h-3 w-3" /> {creator.correo}
        </div>
      </div>
    </div>
  );
}
