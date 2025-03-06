
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useParams, useNavigate } from "react-router-dom";
import { PendingServiceCard } from "@/components/services/PendingServiceCard";
import { SignedServiceCard } from "@/components/services/SignedServiceCard";
import type { CreatorService, PendingService } from "@/types/services";

export default function PendingServices() {
  const [services, setServices] = useState<PendingService[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchServices();
    }
  }, [user, id]);

  async function fetchServices() {
    try {
      const query = supabase
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
        .eq("profile_id", user?.id);

      if (id) {
        query.eq("id", id);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const formattedServices = data.map((item: CreatorService) => ({
          id: item.services.id,
          name: item.services.name,
          creator_service_id: item.id,
          terms_conditions: item.terms_conditions || item.services.terms_conditions,
          terms_accepted: item.terms_accepted,
          status: item.status,
          updated_at: item.updated_at
        }));
        setServices(formattedServices);
      }
    } catch (error: any) {
      console.error("Error fetching services:", error);
      toast.error("Error fetching services");
    }
  }

  async function acceptTerms(creatorServiceId: string, serviceName: string, terms_conditions: string | null) {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("creator_services")
        .update({
          terms_accepted: true,
          status: "activo",
          terms_conditions: terms_conditions
        })
        .eq("id", creatorServiceId);

      if (error) throw error;

      // Refresh services after accepting terms
      await fetchServices();
      toast.success(`Terms accepted for ${serviceName}`);
    } catch (error: any) {
      console.error("Error accepting terms:", error);
      toast.error("Error accepting terms");
    } finally {
      setLoading(false);
    }
  }

  // Separate services into signed and unsigned
  const signedServices = services.filter(service => service.terms_accepted);
  const unsignedServices = services.filter(service => !service.terms_accepted);

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className={cn(
          "flex-1 overflow-y-auto p-6",
          isMobile && "pb-20"
        )}>
          <div className="max-w-3xl mx-auto space-y-6">
            {unsignedServices.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Servicios Pendientes de Firma</h3>
                  <div className="space-y-4">
                    {unsignedServices.map((service) => (
                      <PendingServiceCard
                        key={service.creator_service_id}
                        service={service}
                        onAcceptTerms={acceptTerms}
                        loading={loading}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {signedServices.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Servicios Firmados</h3>
                  <div className="space-y-4">
                    {signedServices.map((service) => (
                      <SignedServiceCard
                        key={service.creator_service_id}
                        service={service}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {services.length === 0 && (
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">No se encontraron servicios</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
