
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchCreators } from "@/services/creatorService";
import { fetchTikTokUserInfo, updateCreatorTikTokInfo, fetchTikTokUserVideos } from "@/services/tiktokVideoService";
import { Creator } from "@/types/creator";
import { CreatorFilter } from "@/components/admin/inventory/import-templates/types";
import { CreatorsListProps } from "./types";
import { CreatorsTable } from "./CreatorsTable";
import { FilterBar } from "./FilterBar";
import { BulkUpdateTikTokInfoButton, BulkDownloadTikTokVideosButton } from "./BulkActions";
import { BulkActionsBar } from "./BulkActionsBar";
import { PaginationControls } from "./PaginationControls";
import { EditDialog } from "./EditDialog";

export function CreatorsList({ 
  onCreatorSelect, 
  filters = {}, 
  onFilterChange 
}: CreatorsListProps) {
  const [editCreator, setEditCreator] = useState<Creator | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingTikTokInfo, setLoadingTikTokInfo] = useState<string | null>(null);
  const [loadingTikTokVideos, setLoadingTikTokVideos] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [activeFilters, setActiveFilters] = useState<CreatorFilter>(filters);
  const [bulkUpdatingTikTok, setBulkUpdatingTikTok] = useState(false);
  const [bulkUpdateProgress, setBulkUpdateProgress] = useState<{current: number, total: number}>({current: 0, total: 0});
  const [bulkDownloadingVideos, setBulkDownloadingVideos] = useState(false);
  const [bulkVideoProgress, setBulkVideoProgress] = useState<{current: number, total: number}>({current: 0, total: 0});
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);

  const { 
    data: creatorsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["creators", currentPage, pageSize, activeFilters],
    queryFn: () => fetchCreators(currentPage, pageSize, activeFilters),
  });

  const creators = creatorsData?.data || [];
  const totalCount = creatorsData?.count || 0;

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(activeFilters);
    }
    setCurrentPage(1);
  }, [activeFilters, onFilterChange]);

  useEffect(() => {
    setSelectedCreators([]);
  }, [currentPage, pageSize]);

  const updateTikTokInfoMutation = useMutation({
    mutationFn: async ({ creatorId, username }: { creatorId: string; username: string }) => {
      const userInfo = await fetchTikTokUserInfo(username);
      
      console.log('Processing TikTok user info result:', userInfo);
      
      const followerCount = userInfo?.userInfo?.stats?.followerCount;
      const heartCount = userInfo?.userInfo?.stats?.heartCount;
      const secUid = userInfo?.userInfo?.user?.secUid;
      
      console.log('Extracted follower count:', followerCount);
      console.log('Extracted heart count:', heartCount);
      console.log('Extracted secUid:', secUid);
      
      let engagementRate: number | undefined = undefined;
      
      if (followerCount && heartCount && followerCount > 0) {
        engagementRate = (heartCount / followerCount) * 100; // Convertir a porcentaje
        console.log('Calculated engagement rate:', engagementRate);
      }
      
      if (followerCount !== undefined) {
        await updateCreatorTikTokInfo(creatorId, followerCount, engagementRate, secUid);
        
        const isEligible = followerCount >= 100000;
        return { followerCount, isEligible, secUid, engagementRate };
      }
      
      throw new Error('No se pudo obtener el número de seguidores');
    },
    onSuccess: (data, variables) => {
      const eligibilityStatus = data.isEligible ? 'elegible' : 'no elegible';
      const engagementInfo = data.engagementRate !== undefined ? 
        ` (Engagement: ${data.engagementRate.toFixed(2)}%)` : '';
      
      toast.success(`Información de TikTok actualizada. Seguidores: ${data.followerCount.toLocaleString()} ${engagementInfo} (${eligibilityStatus})`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error al obtener información de TikTok: ${(error as Error).message}`);
    },
    onSettled: () => {
      setLoadingTikTokInfo(null);
    }
  });

  const fetchTikTokVideosMutation = useMutation({
    mutationFn: async ({ creatorId, username }: { creatorId: string; username: string }) => {
      const result = await fetchTikTokUserVideos(username, creatorId);
      return result;
    },
    onSuccess: (data, variables) => {
      toast.success(`Se guardaron ${data.savedCount} videos de TikTok de @${variables.username} (${data.savedCount}/${data.totalCount})`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error al obtener videos de TikTok: ${(error as Error).message}`);
    },
    onSettled: () => {
      setLoadingTikTokVideos(null);
    }
  });

  const updateSelectedCreatorsTikTokInfo = async () => {
    if (selectedCreators.length === 0) {
      toast.warning("No hay creadores seleccionados");
      return;
    }

    try {
      setBulkUpdatingTikTok(true);
      
      const selectedCreatorsWithTikTok = creators.filter(
        creator => selectedCreators.includes(creator.id) && creator.usuario_tiktok
      );
      
      if (selectedCreatorsWithTikTok.length === 0) {
        toast.warning("Ninguno de los creadores seleccionados tiene nombre de usuario de TikTok");
        setBulkUpdatingTikTok(false);
        return;
      }
      
      setBulkUpdateProgress({current: 0, total: selectedCreatorsWithTikTok.length});
      
      let successCount = 0;
      let failCount = 0;
      
      for (let i = 0; i < selectedCreatorsWithTikTok.length; i++) {
        const creator = selectedCreatorsWithTikTok[i];
        setBulkUpdateProgress({current: i + 1, total: selectedCreatorsWithTikTok.length});
        
        if (creator.usuario_tiktok) {
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const userInfo = await fetchTikTokUserInfo(creator.usuario_tiktok);
            
            const followerCount = userInfo?.userInfo?.stats?.followerCount;
            const heartCount = userInfo?.userInfo?.stats?.heartCount;
            const secUid = userInfo?.userInfo?.user?.secUid;
            
            let engagementRate: number | undefined = undefined;
            
            if (followerCount && heartCount && followerCount > 0) {
              engagementRate = (heartCount / followerCount) * 100;
            }
            
            if (followerCount !== undefined) {
              await updateCreatorTikTokInfo(creator.id, followerCount, engagementRate, secUid);
              successCount++;
            } else {
              failCount++;
            }
          } catch (err) {
            console.error(`Error actualizando creador ${creator.nombre} ${creator.apellido}:`, err);
            failCount++;
          }
        }
      }
      
      toast.success(`Actualización completada: ${successCount} creadores actualizados, ${failCount} fallidos`);
      refetch();
      setSelectedCreators([]);
    } catch (error) {
      console.error("Error en actualización de seleccionados:", error);
      toast.error(`Error en actualización de seleccionados: ${(error as Error).message}`);
    } finally {
      setBulkUpdatingTikTok(false);
      setBulkUpdateProgress({current: 0, total: 0});
    }
  };

  const downloadSelectedCreatorVideos = async () => {
    if (selectedCreators.length === 0) {
      toast.warning("No hay creadores seleccionados");
      return;
    }

    try {
      setBulkDownloadingVideos(true);
      
      const selectedCreatorsWithTikTok = creators.filter(
        creator => selectedCreators.includes(creator.id) && creator.usuario_tiktok
      );
      
      if (selectedCreatorsWithTikTok.length === 0) {
        toast.warning("Ninguno de los creadores seleccionados tiene nombre de usuario de TikTok");
        setBulkDownloadingVideos(false);
        return;
      }
      
      setBulkVideoProgress({current: 0, total: selectedCreatorsWithTikTok.length});
      
      let successCount = 0;
      let failCount = 0;
      let totalVideos = 0;
      
      for (let i = 0; i < selectedCreatorsWithTikTok.length; i++) {
        const creator = selectedCreatorsWithTikTok[i];
        setBulkVideoProgress({current: i + 1, total: selectedCreatorsWithTikTok.length});
        
        if (creator.usuario_tiktok) {
          try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const result = await fetchTikTokUserVideos(creator.usuario_tiktok, creator.id);
            totalVideos += result.savedCount;
            successCount++;
          } catch (err) {
            console.error(`Error descargando videos para ${creator.nombre} ${creator.apellido}:`, err);
            failCount++;
          }
        }
      }
      
      toast.success(`Descarga completada: ${successCount} creadores procesados, ${totalVideos} videos guardados, ${failCount} errores`);
      refetch();
      setSelectedCreators([]);
    } catch (error) {
      console.error("Error en descarga de videos:", error);
      toast.error(`Error en descarga de videos: ${(error as Error).message}`);
    } finally {
      setBulkDownloadingVideos(false);
      setBulkVideoProgress({current: 0, total: 0});
    }
  };

  const handleEdit = (creator: Creator) => {
    if (onCreatorSelect) {
      onCreatorSelect(creator);
    } else {
      setEditCreator(creator);
      setIsEditDialogOpen(true);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value));
    setCurrentPage(1);
  };

  const handleFetchTikTokInfo = (creatorId: string, username: string) => {
    if (!username) {
      toast.error("Este creador no tiene un nombre de usuario de TikTok");
      return;
    }
    
    setLoadingTikTokInfo(creatorId);
    updateTikTokInfoMutation.mutate({ creatorId, username });
  };

  const handleFetchTikTokVideos = (creatorId: string, username: string) => {
    if (!username) {
      toast.error("Este creador no tiene un nombre de usuario de TikTok");
      return;
    }
    
    setLoadingTikTokVideos(creatorId);
    fetchTikTokVideosMutation.mutate({ creatorId, username });
  };

  const toggleFilter = (filterName: keyof CreatorFilter) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      newFilters[filterName] = !prev[filterName];
      
      if (!newFilters[filterName]) {
        delete newFilters[filterName];
      }
      
      return newFilters;
    });
  };

  const clearFilters = () => {
    setActiveFilters({});
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        Error al cargar los creadores: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Lista de Creadores</h2>
          <p className="text-gray-500">Total: {totalCount} creadores</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <BulkUpdateTikTokInfoButton 
            selectedCreators={[]} 
            creators={creators} 
            onSuccess={refetch} 
            isDisabled={bulkUpdatingTikTok || bulkDownloadingVideos}
          />
          
          <BulkDownloadTikTokVideosButton 
            selectedCreators={[]} 
            creators={creators} 
            onSuccess={refetch} 
            isDisabled={bulkUpdatingTikTok || bulkDownloadingVideos}
          />
          
          <BulkActionsBar 
            selectedCreators={selectedCreators}
            creators={creators}
            onUpdateTikTokInfo={updateSelectedCreatorsTikTokInfo}
            onDownloadVideos={downloadSelectedCreatorVideos}
            bulkUpdatingTikTok={bulkUpdatingTikTok}
            bulkDownloadingVideos={bulkDownloadingVideos}
            bulkUpdateProgress={bulkUpdateProgress}
            bulkVideoProgress={bulkVideoProgress}
          />
          
          <FilterBar 
            activeFilters={activeFilters} 
            toggleFilter={toggleFilter} 
            clearFilters={clearFilters} 
          />
        </div>
      </div>
      
      {creators.length === 0 ? (
        <div className="p-8 text-center text-gray-500 border rounded-md">
          No hay creadores que coincidan con los criterios seleccionados
        </div>
      ) : (
        <>
          <CreatorsTable
            creators={creators}
            selectedCreators={selectedCreators}
            setSelectedCreators={setSelectedCreators}
            onEditClick={handleEdit}
            onTikTokInfoClick={handleFetchTikTokInfo}
            onTikTokVideosClick={handleFetchTikTokVideos}
            loadingTikTokInfo={loadingTikTokInfo}
            loadingTikTokVideos={loadingTikTokVideos}
            onCreatorSelect={onCreatorSelect}
          />

          <PaginationControls
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      {!onCreatorSelect && (
        <EditDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          creator={editCreator}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
