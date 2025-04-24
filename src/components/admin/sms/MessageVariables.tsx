
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MessageVariablesProps {
  hasNameVariable: boolean;
  hasLinkVariable: boolean;
  name: string;
  linkInvitation: string;
  onNameChange: (name: string) => void;
  onLinkChange: (link: string) => void;
}

export function MessageVariables({
  hasNameVariable,
  hasLinkVariable,
  name,
  linkInvitation,
  onNameChange,
  onLinkChange
}: MessageVariablesProps) {
  if (!hasNameVariable && !hasLinkVariable) return null;

  return (
    <>
      {hasNameVariable && (
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Juan Pérez"
          />
        </div>
      )}

      {hasLinkVariable && (
        <div>
          <Label htmlFor="link">Link de invitación</Label>
          <Input
            id="link"
            value={linkInvitation}
            onChange={(e) => onLinkChange(e.target.value)}
            placeholder="https://example.com/invitation/123"
          />
        </div>
      )}
    </>
  );
}
