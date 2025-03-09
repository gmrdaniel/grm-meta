
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Service {
  id: string;
  name: string;
  type: 'único' | 'recurrente' | 'contrato';
  description: string | null;
  fixed_fee: number | null;
  contract_duration: number | null;
}

export interface CreatorService {
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

export const useCreatorServices = (creatorId: string | undefined) => {
  const [creatorServices, setCreatorServices] = useState<CreatorService[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [addingService, setAddingService] = useState(false);
  
  useEffect(() => {
    if (creatorId) {
      fetchCreatorServices(creatorId);
      fetchAvailableServices();
    }
  }, [creatorId]);

  async function fetchCreatorServices(id: string) {
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
        .eq("profile_id", id);

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

  async function handleAddService(id: string) {
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
          profile_id: id,
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
          profile_id: id,
          type: "new_service",
          message: `Se ha asignado un nuevo servicio: ${serviceData.service.name}. Por favor, revisa los términos y condiciones.`,
          status: "unread"
        });

      if (notificationError) throw notificationError;
      
      toast.success("Service added successfully");
      fetchCreatorServices(id);
      setSelectedServiceId("");
    } catch (error: any) {
      toast.error(error.message);
      console.error("Error:", error);
    } finally {
      setAddingService(false);
    }
  }

  return {
    creatorServices,
    availableServices,
    selectedServiceId,
    setSelectedServiceId,
    addingService,
    handleAddService
  };
};
