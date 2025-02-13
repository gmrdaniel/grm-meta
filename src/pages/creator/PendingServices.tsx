
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useParams, useNavigate } from "react-router-dom";
import { PendingServiceCard } from "@/components/services/PendingServiceCard";
import type { CreatorService, PendingService } from "@/types/services";

export default function PendingServices() {
  const [pendingServices, setPendingServices] = useState<PendingService[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      checkPendingServices();
    }
  }, [user, id]);

  async function checkPendingServices() {
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
          updated_at
        `)
        .eq("profile_id", user?.id)
        .eq("terms_accepted", false);

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
          terms_conditions: item.services.terms_conditions,
          terms_accepted: item.terms_accepted,
          updated_at: item.updated_at
        }));
        setPendingServices(formattedServices);
      }
    } catch (error: any) {
      console.error("Error checking pending services:", error);
      toast.error("Error checking pending services");
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

      setPendingServices(prev => 
        prev.filter(service => service.creator_service_id !== creatorServiceId)
      );

      toast.success(`Terms accepted for ${serviceName}`);
      navigate("/creator/services");
    } catch (error: any) {
      console.error("Error accepting terms:", error);
      toast.error("Error accepting terms");
    } finally {
      setLoading(false);
    }
  }

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
            <Card>
              {pendingServices.length === 0 ? (
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">No pending services found</p>
                </CardContent>
              ) : (
                <div className="space-y-4 p-6">
                  {pendingServices.map((service) => (
                    <PendingServiceCard
                      key={service.creator_service_id}
                      service={service}
                      onAcceptTerms={acceptTerms}
                      loading={loading}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
