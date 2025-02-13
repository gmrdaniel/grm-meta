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
import { PersonalInfoCard } from "@/components/creator/PersonalInfoCard";
import { format } from "date-fns";

interface Service {
  id: string;
  name: string;
  terms_conditions: string | null;
}

interface CreatorService {
  id: string;
  services: Service;
  updated_at: string;
  terms_accepted: boolean;
}

interface PendingService {
  id: string;
  name: string;
  creator_service_id: string;
  terms_conditions: string | null;
  terms_accepted: boolean;
  updated_at: string;
}

interface PersonalData {
  first_name: string | null;
  last_name: string | null;
}

export default function PendingServices() {
  const [pendingServices, setPendingServices] = useState<PendingService[]>([]);
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      fetchPersonalData();
      checkPendingServices();
    }
  }, [user]);

  async function fetchPersonalData() {
    try {
      const { data, error } = await supabase
        .from("personal_data")
        .select("first_name, last_name")
        .eq("profile_id", user?.id)
        .single();

      if (error) throw error;
      setPersonalData(data);
    } catch (error: any) {
      console.error("Error fetching personal data:", error);
      toast.error("Error fetching personal data");
    }
  }

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
          updated_at
        `)
        .eq("profile_id", user?.id);

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

      // Actualizar el estado local
      setPendingServices(prev => 
        prev.map(service => 
          service.creator_service_id === creatorServiceId 
            ? { ...service, terms_accepted: true } 
            : service
        )
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
          <div className="max-w-3xl mx-auto space-y-6">
            {personalData && (
              <Card>
                <CardHeader>
                  <CardTitle>Creator Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">First Name</dt>
                      <dd className="text-base">{personalData.first_name || "Not set"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                      <dd className="text-base">{personalData.last_name || "Not set"}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            )}
            
            <Card>
                           
                {pendingServices.length === 0 ? (
                  <p className="text-sm text-gray-500">No services found</p>
                ) : (
                  <div className="space-y-4">
                    {pendingServices.map((service) => (
                      <div
                        key={service.creator_service_id}
                        className="p-4 border rounded-lg bg-gray-50"
                      >
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-base font-medium text-gray-900">{service.name}</h4>
                          </div>
                          
                          <div className="bg-white p-3 rounded-md">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Terms & Conditions</h5>
                            {service.terms_conditions ? (
                              <div 
                                className="prose prose-sm max-w-none text-gray-600 [&>*]:p-0 [&>*]:m-0"
                                dangerouslySetInnerHTML={{ __html: service.terms_conditions }}
                              />
                            ) : (
                              <p className="text-xs text-gray-500 italic">No terms and conditions provided</p>
                            )}
                          </div>

                          {!service.terms_accepted ? (
                            <>
                              <p className="text-[0.7rem] text-gray-500">
                                Please review and accept the terms for this service
                              </p>
                              <div className="flex justify-end">
                                <Button
                                  size="sm"
                                  onClick={() => acceptTerms(service.creator_service_id, service.name, service.terms_conditions)}
                                  disabled={loading}
                                >
                                  Accept Terms & Conditions
                                </Button>
                              </div>
                            </>
                          ) : (
                            <p className="text-xs text-green-600">
                              Terms accepted on {format(new Date(service.updated_at), 'PPP')}
                            </p>
                          )}
                        </div>
                      </div>
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
