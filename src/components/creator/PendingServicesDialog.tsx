
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import type { PendingService } from "@/types/services";

export function PendingServicesDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingServices, setPendingServices] = useState<PendingService[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkPendingServices();
    }
  }, [user]);

  async function checkPendingServices() {
    try {
      const { data, error } = await supabase
        .from("creator_services")
        .select(`
          id,
          services (
            id,
            name,
            terms_conditions
          ),
          terms_accepted,
          terms_conditions,
          status,
          updated_at
        `)
        .eq("profile_id", user?.id)
        .eq("terms_accepted", false)
        .eq("status", "pendiente");

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedServices = data.map((item) => ({
          id: item.services.id,
          name: item.services.name,
          creator_service_id: item.id,
          terms_conditions: item.terms_conditions || item.services.terms_conditions,
          terms_accepted: item.terms_accepted,
          updated_at: item.updated_at,
          status: item.status
        }));
        setPendingServices(formattedServices);
        setIsOpen(true);
      }
    } catch (error: any) {
      console.error("Error checking pending services:", error);
      toast.error("Error checking pending services");
    }
  }

  async function acceptTerms(creatorServiceId: string, serviceName: string) {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("creator_services")
        .update({
          terms_accepted: true,
          status: "activo"
        })
        .eq("id", creatorServiceId)
        .eq("profile_id", user?.id);

      if (error) throw error;

      setPendingServices(prev => 
        prev.filter(service => service.creator_service_id !== creatorServiceId)
      );

      toast.success(`Terms accepted for ${serviceName}`);

      // Si no hay más servicios pendientes, cerrar el diálogo
      if (pendingServices.length === 1) {
        setIsOpen(false);
      }
    } catch (error: any) {
      console.error("Error accepting terms:", error);
      toast.error("Error accepting terms");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pending Services</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {pendingServices.map((service) => (
            <div
              key={service.creator_service_id}
              className="p-4 border rounded-lg bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">{service.name}</h4>
                  <p className="text-sm text-gray-500">
                    Please review and accept the terms for this service
                  </p>
                </div>
                <Button
                  onClick={() => acceptTerms(service.creator_service_id, service.name)}
                  disabled={loading}
                >
                  Accept
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
