
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { PersonalInfoCard } from "@/components/creator/PersonalInfoCard";
import { BankDetailsCard } from "@/components/creator/BankDetailsCard";
import { ServicesCard } from "@/components/creator/ServicesCard";

interface CreatorDetail {
  email: string;
  id: string;
  created_at: string;
  personal_data: {
    first_name: string;
    last_name: string;
    instagram_username: string;
    birth_date: string;
    country_of_residence: string;
    state_of_residence: string;
    phone_number: string;
    gender: string;
    category: string;
  };
  bank_details: {
    beneficiary_name: string;
    payment_method: "bank_transfer" | "paypal";
    country: string;
    bank_account_number: string;
    iban: string;
    swift_bic: string;
    bank_name: string;
    bank_address: string;
    routing_number: string;
    clabe: string;
    paypal_email: string;
  } | null;
}

interface Service {
  id: string;
  name: string;
  type: 'único' | 'recurrente' | 'contrato';
  description: string | null;
  fixed_fee: number | null;
  contract_duration: number | null;
}

interface CreatorService {
  id: string;
  service: Service;
  status: string;
  start_date: string;
  end_date: string | null;
  monthly_fee: number | null;
  company_share: number | null;
  total_revenue: number | null;
  terms_accepted: boolean;
  fixed_fee: number | null;
  contract_duration: number | null;
}

export default function CreatorDetail() {
  const { id: creatorId } = useParams<{ id: string }>();
  const [creator, setCreator] = useState<CreatorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatorServices, setCreatorServices] = useState<CreatorService[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [addingService, setAddingService] = useState(false);

  useEffect(() => {
    const fetchCreatorDetails = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            email,
            id,
            created_at,
            personal_data (
              first_name,
              last_name,
              instagram_username,
              birth_date,
              country_of_residence,
              state_of_residence,
              phone_number,
              gender,
              category
            ),
            bank_details (
              beneficiary_name,
              payment_method,
              country,
              bank_account_number,
              iban,
              swift_bic,
              bank_name,
              bank_address,
              routing_number,
              clabe,
              paypal_email
            )
          `)
          .eq('id', creatorId)
          .single();

        if (error) throw error;
        
        // Modificar cómo se maneja bank_details
        if (data) {
          const creatorData = {
            ...data,
            bank_details: data.bank_details && data.bank_details.length > 0 
              ? data.bank_details[0] 
              : null
          };
          
          setCreator(creatorData);
        }
        
      } catch (error) {
        console.error('Error fetching creator details:', error);
        toast.error("No se pudieron cargar los detalles del creador.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCreatorDetails();
    fetchCreatorServices();
    fetchAvailableServices();
  }, [creatorId]);

  async function fetchCreatorServices() {
    try {
      const { data, error } = await supabase
        .from("creator_services")
        .select(`
          id,
          status,
          start_date,
          end_date,
          monthly_fee,
          company_share,
          total_revenue,
          terms_accepted,
          fixed_fee,
          contract_duration,
          service:services (
            id,
            name,
            type,
            description,
            fixed_fee,
            contract_duration
          )
        `)
        .eq("profile_id", creatorId);

      if (error) throw error;
      
      const typedServices: CreatorService[] = data?.map(item => ({
        ...item,
        service: {
          ...item.service,
          type: item.service.type as 'único' | 'recurrente' | 'contrato'
        }
      })) || [];
      
      setCreatorServices(typedServices);
    } catch (error: any) {
      toast.error("Error fetching creator services");
      console.error("Error:", error.message);
    }
  }

  async function fetchAvailableServices() {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, type, description, fixed_fee, contract_duration")
        .order("name");

      if (error) throw error;
      
      const typedServices: Service[] = data?.map(service => ({
        ...service,
        type: service.type as 'único' | 'recurrente' | 'contrato'
      })) || [];
      
      setAvailableServices(typedServices);
    } catch (error: any) {
      toast.error("Error fetching available services");
      console.error("Error:", error.message);
    }
  }

  async function handleAddService() {
    if (!selectedServiceId) {
      toast.error("Please select a service");
      return;
    }

    setAddingService(true);
    try {
      const selectedService = availableServices.find(service => service.id === selectedServiceId);
      
      if (!selectedService) {
        throw new Error("Selected service not found");
      }

      const { data: serviceData, error: serviceError } = await supabase
        .from("creator_services")
        .insert({
          profile_id: creatorId,
          service_id: selectedServiceId,
          status: 'pendiente',
          terms_accepted: false,
          fixed_fee: selectedService.fixed_fee,
          contract_duration: selectedService.contract_duration
        })
        .select(`
          id,
          service:services (
            name
          )
        `)
        .single();

      if (serviceError) throw serviceError;

      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          profile_id: creatorId,
          type: "new_service",
          message: `Se ha asignado un nuevo servicio: ${serviceData.service.name}. Por favor, revisa los términos y condiciones.`,
          status: "unread"
        });

      if (notificationError) throw notificationError;
      
      toast.success("Service added successfully");
      fetchCreatorServices();
      setSelectedServiceId("");
    } catch (error: any) {
      toast.error(error.message);
      console.error("Error:", error);
    } finally {
      setAddingService(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!creator) {
    return <div>Creator not found</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link to="/admin/creators">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Creators
                </Button>
              </Link>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium mb-4">Correo Electrónico</h3>
                <input
                  type="email"
                  value={creator.email || ''}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600"
                />
              </div>
              <PersonalInfoCard personalData={creator.personal_data} />
              <BankDetailsCard bankDetails={creator.bank_details} />
              <ServicesCard
                creatorServices={creatorServices}
                availableServices={availableServices}
                selectedServiceId={selectedServiceId}
                onServiceSelect={setSelectedServiceId}
                onAddService={handleAddService}
                addingService={addingService}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
