
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface InvitationDetail {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  status: string;
  invitation_link?: string;
}

interface CreatorsTableProps {
  invitationDetails: InvitationDetail[];
}

export function CreatorsTable({ invitationDetails }: CreatorsTableProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copiado al portapapeles');
  };

  if (invitationDetails.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">Creadores Importados</h3>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Link de Invitación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitationDetails.map((detail) => (
              <TableRow key={detail.id}>
                <TableCell>{detail.full_name}</TableCell>
                <TableCell>{detail.email}</TableCell>
                <TableCell>{detail.is_active ? 'Activo' : 'Inactivo'}</TableCell>
                <TableCell>
                  {detail.invitation_link ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => copyToClipboard(detail.invitation_link!)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Copiar Link
                    </Button>
                  ) : (
                    'No requiere invitación'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
