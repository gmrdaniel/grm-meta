
import { useState } from "react";
import { CreatorServicesHeader } from "./CreatorServicesHeader";
import { CreatorServicesTableContent } from "./CreatorServicesTableContent";
import { CreatorServicesPagination } from "./CreatorServicesPagination";
import { useCreatorServices } from "./hooks/useCreatorServices";
import { useServices } from "./hooks/useServices";

export function CreatorServicesTable() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);
  const pageSize = 10;

  const { data: services } = useServices();
  const { data, isLoading } = useCreatorServices(
    page,
    pageSize,
    searchTerm,
    selectedServiceId,
    showAll
  );

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

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
      />

      <div className="rounded-md border">
        <CreatorServicesTableContent
          isLoading={isLoading}
          creatorServices={data?.creatorServices}
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
