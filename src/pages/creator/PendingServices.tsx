
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
import MDEditor from '@uiw/react-md-editor';

interface Service {
  id: string;
  name: string;
  terms_conditions: string | null;
}

interface CreatorService {
  id: string;
  services: Service;
}

interface PendingService {
  id: string;
  name: string;
  creator_service_id: string;
  terms_conditions: string | null;
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
            name,
            terms_conditions
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
          creator_service_id: item.id,
          terms_conditions: item.services.terms_conditions
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
          terms_conditions: terms_conditions // Guardamos una copia de los términos aceptados
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
                  <div className="space-y-6">
                    {pendingServices.map((service) => (
                      <div
                        key={service.creator_service_id}
                        className="p-6 border rounded-lg bg-gray-50"
                      >
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{service.name}</h4>
                            <p className="text-sm text-gray-500 mb-4">
                              Please review and accept the terms for this service
                            </p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-md">
                            <h5 className="font-medium text-gray-700 mb-2">Terms & Conditions</h5>
                            {service.terms_conditions ? (
                              <div data-color-mode="light" className="mb-4">
                                <MDEditor.Markdown 
                                  source={service.terms_conditions} 
                                  style={{ whiteSpace: 'pre-wrap' }}
                                />
                              </div>
                            ) : (
                              <p className="text-gray-500 italic">No terms and conditions provided</p>
                            )}
                          </div>

                          <div className="flex justify-end">
                            <Button
                              onClick={() => acceptTerms(service.creator_service_id, service.name, service.terms_conditions)}
                              disabled={loading}
                            >
                              Accept Terms & Conditions
                            </Button>
                          </div>
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
