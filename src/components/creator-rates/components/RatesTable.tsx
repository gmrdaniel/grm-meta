
import { Badge } from "@/components/ui/badge";
import type { Rate } from "../types";

interface RatesTableProps {
  rates?: Rate[];
}

export function RatesTable({ rates = [] }: RatesTableProps) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-4 text-left">Creador</th>
            <th className="p-4 text-left">Plataforma</th>
            <th className="p-4 text-left">Tipo</th>
            <th className="p-4 text-left">Tarifa (USD)</th>
            <th className="p-4 text-left">Estado</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((rate) => (
            <tr key={rate.id} className="border-b">
              <td className="p-4">
                {rate.creator_profile?.full_name}
              </td>
              <td className="p-4">
                {rate.post_types?.social_platforms?.name}
              </td>
              <td className="p-4">{rate.post_types?.name}</td>
              <td className="p-4">${rate.rate_usd}</td>
              <td className="p-4">
                <Badge
                  variant={rate.is_active ? "default" : "secondary"}
                >
                  {rate.is_active ? "Activa" : "Inactiva"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
