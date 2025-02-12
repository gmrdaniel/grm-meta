
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface Service {
  id: string;
  name: string;
}

interface CreatorService {
  id: string;
  services: Service;
}

interface PendingService {
  id: string;
  name: string;
  creator_service_id: string;
}

export default function PendingServices() {
  const [pendingServices, setPendingServices] = useState<PendingService[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();

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
            name
          )
        `)
        .eq("profile_id", user?.id)
        .eq("terms_accepted", false)
        .eq("status", "pendiente");

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedServices = data.map((item: CreatorService) => ({
          id: item.services.id,
          name: item.services.name,
          creator_service_id: item.id
        }));
        setPendingServices(formattedServices);
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
        .eq("id", creatorServiceId);

      if (error) throw error;

      setPendingServices(prev => 
        prev.filter(service => service.creator_service_id !== creatorServiceId)
      );

      toast.success(`Terms accepted for ${serviceName}`);
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
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-semibold text-gray-800">Pending Services</h1>
            
            <Card>
              <CardHeader>
                <CardTitle>Services Pending Approval</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingServices.length === 0 ? (
                  <p className="text-gray-500">No pending services</p>
                ) : (
                  <div className="space-y-4">
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
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
