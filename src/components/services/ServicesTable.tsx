
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string | null;
  type: 'único' | 'recurrente' | 'contrato';
  company_share_min: number;
  company_share_max: number;
  fixed_fee: number;
  max_revenue: number | null;
  contract_duration: number | null;
  renewable: boolean;
}

interface ServicesTableProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
}

export function ServicesTable({ services, onEdit, onDelete }: ServicesTableProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Company Share</TableHead>
            <TableHead>Fixed Fee</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell>{service.type}</TableCell>
              <TableCell>{`${service.company_share_min}% - ${service.company_share_max}%`}</TableCell>
              <TableCell>${service.fixed_fee}</TableCell>
              <TableCell className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(service)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(service.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
