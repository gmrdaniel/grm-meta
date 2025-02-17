
import { useState } from "react";
import { CreatorServicesHeader } from "./CreatorServicesHeader";
import { CreatorServicesTableContent } from "./CreatorServicesTableContent";
import { CreatorServicesPagination } from "./CreatorServicesPagination";
import { useCreatorServices } from "./hooks/useCreatorServices";
import { useServices } from "@/hooks/useServices";

interface CreatorServicesTableProps {
  onServiceSelect: (serviceId: string) => void;
}

export function CreatorServicesTable({ onServiceSelect }: CreatorServicesTableProps) {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);
  const [showRecurring, setShowRecurring] = useState(true);
  const pageSize = 10;

  const { data: services, isLoading: isLoadingServices } = useServices();
  const { data, isLoading: isLoadingCreatorServices } = useCreatorServices(
    page,
    pageSize,
    searchTerm,
    selectedServiceId,
    showAll,
    showRecurring
  );

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  if (isLoadingServices) {
    return <div className="p-4">Cargando servicios...</div>;
  }

  return (
    <div className="space-y-6">
      <CreatorServicesHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedServiceId={selectedServiceId}
        setSelectedServiceId={setSelectedServiceId}
        services={services}
        showAll={showAll}
        setShowAll={setShowAll}
        showRecurring={showRecurring}
        setShowRecurring={setShowRecurring}
      />

      <div className="rounded-md border">
        <CreatorServicesTableContent
          isLoading={isLoadingCreatorServices}
          creatorServices={data?.creatorServices}
          onServiceSelect={onServiceSelect}
        />
      </div>

      <CreatorServicesPagination
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
  );
}
