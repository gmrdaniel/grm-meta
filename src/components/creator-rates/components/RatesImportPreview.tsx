
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RatesImportPreviewProps {
  importId: string;
}

export function RatesImportPreview({ importId }: RatesImportPreviewProps) {
  const { data: details, isLoading } = useQuery({
    queryKey: ['rate-import-details', importId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rate_import_details')
        .select('*')
        .eq('import_id', importId);

      if (error) throw error;
      return data;
    }
  });

  const handleConfirmImport = async () => {
    try {
      const validRows = details?.filter(d => !d.error_message) || [];
      
      if (validRows.length === 0) {
        toast.error("No hay filas válidas para importar");
        return;
      }

      const { error } = await supabase
        .from('creator_rates')
        .insert(
          validRows.map(d => ({
            profile_id: d.creator_id,
            post_type_id: d.post_type_id,
            rate_usd: d.rate_usd,
            is_active: d.is_active
          }))
        );

      if (error) throw error;

      // Update import status
      await supabase
        .from('rate_imports')
        .update({ status: 'imported' })
        .eq('id', importId);

      toast.success("Tarifas importadas correctamente");
    } catch (error: any) {
      console.error('Error importing rates:', error);
      toast.error(error.message || "Error al importar tarifas");
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  const hasValidRows = details?.some(d => !d.error_message);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium">Vista Previa de Importación</h4>
        <Button 
          onClick={handleConfirmImport}
          disabled={!hasValidRows}
        >
          Confirmar Importación
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Plataforma</TableHead>
            <TableHead>Tipo de Post</TableHead>
            <TableHead>Tarifa (USD)</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Error</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {details?.map((detail) => (
            <TableRow key={detail.id}>
              <TableCell>{detail.email}</TableCell>
              <TableCell>{detail.platform_name}</TableCell>
              <TableCell>{detail.post_type_name}</TableCell>
              <TableCell>${detail.rate_usd}</TableCell>
              <TableCell>{detail.is_active ? 'Activo' : 'Inactivo'}</TableCell>
              <TableCell className="text-red-500">{detail.error_message}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
