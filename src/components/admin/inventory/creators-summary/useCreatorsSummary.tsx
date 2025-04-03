
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { exportToCsv, formatExportData } from "../export-utils";
import { SummaryCreator } from "./types";

export function useCreatorsSummary() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tiktokEligibleFilter, setTiktokEligibleFilter] = useState(false);
  const [youtubeEligibleFilter, setYoutubeEligibleFilter] = useState(false);
  const [tiktokOrYoutubeEligibleFilter, setTiktokOrYoutubeEligibleFilter] = useState(false);
  const [sortByEligible, setSortByEligible] = useState<'asc' | 'desc' | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const fetchSummaryCreators = async () => {
    try {
      let query = supabase
        .from('summary_creator')
        .select('*');
      
      if (tiktokEligibleFilter) {
        query = query
          .gte('seguidores_tiktok', 100000)
          .gte('engagement_tiktok', 4);
      }

      if (youtubeEligibleFilter) {
        query = query
          .gte('seguidores_youtube', 100000)
          .gte('engagement_youtube', 4);
      }

      if (tiktokOrYoutubeEligibleFilter) {
        // Use OR filter for either TikTok or YouTube eligibility
        query = query.or(
          'and(seguidores_tiktok.gte.100000,engagement_tiktok.gte.4),and(seguidores_youtube.gte.100000,engagement_youtube.gte.4)'
        );
      }
      
      if (sortByEligible) {
        if (sortByEligible === 'desc') {
          query = query.order('seguidores_tiktok', { ascending: false }).order('engagement_tiktok', { ascending: false });
        } else {
          query = query.order('seguidores_tiktok', { ascending: true }).order('engagement_tiktok', { ascending: true });
        }
      } else {
        query = query.order('seguidores_tiktok', { ascending: false });
      }
      
      const { data, error } = await query
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      
      if (error) throw error;
      
      let countQuery = supabase
        .from('summary_creator')
        .select('*', { count: 'exact', head: true });
      
      if (tiktokEligibleFilter) {
        countQuery = countQuery
          .gte('seguidores_tiktok', 100000)
          .gte('engagement_tiktok', 4);
      }

      if (youtubeEligibleFilter) {
        countQuery = countQuery
          .gte('seguidores_youtube', 100000)
          .gte('engagement_youtube', 4);
      }

      if (tiktokOrYoutubeEligibleFilter) {
        // Use OR filter for either TikTok or YouTube eligibility
        countQuery = countQuery.or(
          'and(seguidores_tiktok.gte.100000,engagement_tiktok.gte.4),and(seguidores_youtube.gte.100000,engagement_youtube.gte.4)'
        );
      }
      
      const { count: totalCount, error: countError } = await countQuery;
        
      if (countError) throw countError;
      
      return {
        data: data as SummaryCreator[],
        count: totalCount || 0
      };
    } catch (error) {
      console.error('Error fetching summary creators:', error);
      throw error;
    }
  };
  
  const { data: creatorsData, isLoading, error } = useQuery({
    queryKey: ['summary-creators', currentPage, pageSize, tiktokEligibleFilter, youtubeEligibleFilter, tiktokOrYoutubeEligibleFilter, sortByEligible],
    queryFn: fetchSummaryCreators
  });
  
  const handlePageChange = (newPage: number) => {
    const totalPages = Math.ceil((creatorsData?.count || 0) / pageSize);
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };
  
  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value));
    setCurrentPage(1);
  };
  
  const toggleTiktokEligibleFilter = () => {
    setTiktokEligibleFilter(prev => !prev);
    // Reset the "OR" filter if enabling a specific filter
    if (!tiktokEligibleFilter) {
      setTiktokOrYoutubeEligibleFilter(false);
    }
    setCurrentPage(1);
  };

  const toggleYoutubeEligibleFilter = () => {
    setYoutubeEligibleFilter(prev => !prev);
    // Reset the "OR" filter if enabling a specific filter
    if (!youtubeEligibleFilter) {
      setTiktokOrYoutubeEligibleFilter(false);
    }
    setCurrentPage(1);
  };

  const toggleTiktokOrYoutubeEligibleFilter = () => {
    setTiktokOrYoutubeEligibleFilter(prev => !prev);
    // Reset individual filters if enabling the "OR" filter
    if (!tiktokOrYoutubeEligibleFilter) {
      setTiktokEligibleFilter(false);
      setYoutubeEligibleFilter(false);
    }
    setCurrentPage(1);
  };

  const toggleSortByEligible = () => {
    if (sortByEligible === null) {
      setSortByEligible('desc');
    } else if (sortByEligible === 'desc') {
      setSortByEligible('asc');
    } else {
      setSortByEligible(null);
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setTiktokEligibleFilter(false);
    setYoutubeEligibleFilter(false);
    setTiktokOrYoutubeEligibleFilter(false);
    setSortByEligible(null);
  };
  
  const exportEligibleCreators = async () => {
    setIsExporting(true);
    try {
      let query = supabase
        .from('summary_creator')
        .select('*');

      // Apply filters for export
      if (tiktokEligibleFilter) {
        query = query
          .gte('seguidores_tiktok', 100000)
          .gte('engagement_tiktok', 4);
      }

      if (youtubeEligibleFilter) {
        query = query
          .gte('seguidores_youtube', 100000)
          .gte('engagement_youtube', 4);
      }

      if (tiktokOrYoutubeEligibleFilter) {
        // Use OR filter for either TikTok or YouTube eligibility
        query = query.or(
          'and(seguidores_tiktok.gte.100000,engagement_tiktok.gte.4),and(seguidores_youtube.gte.100000,engagement_youtube.gte.4)'
        );
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast.info("No hay creadores elegibles para exportar");
        return;
      }
      
      const formattedData = formatExportData(data as SummaryCreator[]);
      exportToCsv(formattedData, "creadores_elegibles");
      
      toast.success(`${data.length} creadores elegibles exportados correctamente`);
    } catch (error) {
      console.error('Error exporting eligible creators:', error);
      toast.error("Error al exportar creadores elegibles");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    creators: creatorsData?.data || [],
    totalCount: creatorsData?.count || 0,
    currentPage,
    pageSize,
    isLoading,
    error,
    tiktokEligibleFilter,
    youtubeEligibleFilter,
    tiktokOrYoutubeEligibleFilter,
    sortByEligible,
    isExporting,
    handlePageChange,
    handlePageSizeChange,
    toggleTiktokEligibleFilter,
    toggleYoutubeEligibleFilter,
    toggleTiktokOrYoutubeEligibleFilter,
    toggleSortByEligible,
    clearFilters,
    exportEligibleCreators
  };
}
