
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

interface CreatorService {
  id: string;
  services: {
    id: string;
    name: string;
  };
  terms_accepted: boolean;
  updated_at: string;
}

export default function Services() {
  const [services, setServices] = useState<CreatorService[]>([]);
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchServices();
    }
  }, [user]);

  async function fetchServices() {
    try {
      const { data, error } = await supabase
        .from("creator_services")
        .select(`
          id,
          services (
            id,
            name
          ),
          terms_accepted,
          updated_at
        `)
        .eq("profile_id", user?.id)
        .eq("terms_accepted", true);

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      console.error("Error fetching services:", error);
      toast.error("Error fetching services");
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
            <h1 className="text-2xl font-semibold text-gray-800">My Services</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{service.services.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Accepted on: {format(new Date(service.updated_at), 'PPP')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
