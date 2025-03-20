
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Service } from '@/types/services';
import { toast } from 'sonner';

export const useServices = () => {
  const [isAddingService, setIsAddingService] = useState(false);
  const [isEditingService, setIsEditingService] = useState<Service | null>(null);
  const queryClient = useQueryClient();

  const { data: services, isLoading, error } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Service[];
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (newService: Omit<Service, 'id'>) => {
      const { data, error } = await supabase
        .from('services')
        .insert([newService])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setIsAddingService(false);
      toast.success('Service created successfully');
    },
    onError: (error: any) => {
      toast.error(`Error creating service: ${error.message}`);
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async (updatedService: Service) => {
      const { id, ...serviceData } = updatedService;
      const { data, error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setIsEditingService(null);
      toast.success('Service updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error updating service: ${error.message}`);
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);
      
      if (error) throw error;
      return serviceId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Error deleting service: ${error.message}`);
    },
  });

  return {
    services,
    isLoading,
    error,
    isAddingService,
    setIsAddingService,
    isEditingService,
    setIsEditingService,
    createService: createServiceMutation.mutate,
    updateService: updateServiceMutation.mutate,
    deleteService: deleteServiceMutation.mutate,
    isCreating: createServiceMutation.isPending,
    isUpdating: updateServiceMutation.isPending,
    isDeleting: deleteServiceMutation.isPending
  };
};

export default useServices;
