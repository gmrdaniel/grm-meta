
import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function Utilities() {
  const [isGeneratingPayments, setIsGeneratingPayments] = useState(false);
  const [isUpdatingNames, setIsUpdatingNames] = useState(false);

  const handleGeneratePayments = async () => {
    try {
      setIsGeneratingPayments(true);
      const { data: result, error } = await supabase
        .rpc('generate_monthly_pending_payments');

      if (error) throw error;

      const paymentsGenerated = result || 0;
      toast({
        title: "Pagos generados con éxito",
        description: `Se han generado ${paymentsGenerated} ${paymentsGenerated === 1 ? 'pago pendiente' : 'pagos pendientes'} para el mes actual.`,
      });
    } catch (error) {
      console.error('Error al generar pagos:', error);
      toast({
        variant: "destructive",
        title: "Error al generar pagos",
        description: "No se pudieron generar los pagos pendientes.",
      });
    } finally {
      setIsGeneratingPayments(false);
    }
  };

  const handleUpdateNames = async () => {
    try {
      setIsUpdatingNames(true);
      const { error } = await supabase
        .rpc('update_profile_full_name');

      if (error) throw error;

      toast({
        title: "Nombres actualizados",
        description: "Los nombres completos han sido actualizados correctamente.",
      });
    } catch (error) {
      console.error('Error al actualizar nombres:', error);
      toast({
        variant: "destructive",
        title: "Error al actualizar nombres",
        description: "No se pudieron actualizar los nombres completos.",
      });
    } finally {
      setIsUpdatingNames(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Utilidades del Sistema</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card para Generar Pagos Mensuales */}
              <Card>
                <CardHeader>
                  <CardTitle>Generar Pagos Mensuales</CardTitle>
                  <CardDescription>
                    Genera los pagos pendientes para el mes actual basado en los servicios activos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleGeneratePayments}
                    disabled={isGeneratingPayments}
                    className="w-full"
                  >
                    {isGeneratingPayments ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      "Generar Pagos"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Card para Actualizar Nombres Completos */}
              <Card>
                <CardHeader>
                  <CardTitle>Actualizar Nombres Completos</CardTitle>
                  <CardDescription>
                    Actualiza los nombres completos en la tabla de perfiles basado en nombres y apellidos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleUpdateNames}
                    disabled={isUpdatingNames}
                    className="w-full"
                  >
                    {isUpdatingNames ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      "Actualizar Nombres"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
