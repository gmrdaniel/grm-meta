
import { Badge } from "@/components/ui/badge";
import { Instagram } from "lucide-react";
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
            <th className="p-4 text-left">Email</th>
            <th className="p-4 text-left">Instagram</th>
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
                {rate.creator_profile.full_name}
              </td>
              <td className="p-4">
                {rate.creator_profile.email}
              </td>
              <td className="p-4">
                {rate.creator_profile.personal_data?.[0]?.instagram_username ? (
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    <a
                      href={`https://instagram.com/${rate.creator_profile.personal_data[0].instagram_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      @{rate.creator_profile.personal_data[0].instagram_username}
                    </a>
                  </div>
                ) : (
                  <span className="text-muted-foreground">No disponible</span>
                )}
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
