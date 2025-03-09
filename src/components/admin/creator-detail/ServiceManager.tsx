
import React from 'react';
import { ServicesCard } from "@/components/creator/ServicesCard";
import { CreatorService, Service } from '@/hooks/useCreatorServices';

interface ServiceManagerProps {
  creatorId: string;
  creatorServices: CreatorService[];
  availableServices: Service[];
  selectedServiceId: string;
  onServiceSelect: (id: string) => void;
  onAddService: () => void;
  addingService: boolean;
}

export const ServiceManager = ({
  creatorId,
  creatorServices,
  availableServices,
  selectedServiceId,
  onServiceSelect,
  onAddService,
  addingService
}: ServiceManagerProps) => {
  return (
    <ServicesCard
      creatorServices={creatorServices}
      availableServices={availableServices}
      selectedServiceId={selectedServiceId}
      onServiceSelect={onServiceSelect}
      onAddService={onAddService}
      addingService={addingService}
    />
  );
};
