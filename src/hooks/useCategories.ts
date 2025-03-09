
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category, CategoryFormData } from "@/components/categories/types";
import { toast } from "sonner";

export function useCategories() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories", page, pageSize],
    queryFn: async () => {
      // Calculate start and end records for pagination
      const start = page * pageSize;
      const end = start + pageSize - 1;

      const { data: categories, error, count } = await supabase
        .from("categories")
        .select("*", { count: "exact" })
        .order("name", { ascending: true })
        .range(start, end);

      if (error) throw error;

      return {
        categories: categories as Category[],
        count: count || 0,
      };
    },
  });

  const createCategory = useMutation({
    mutationFn: async (formData: CategoryFormData) => {
      const { data, error } = await supabase
        .from("categories")
        .insert([formData])
        .select()
        .single();

      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoría creada exitosamente");
    },
    onError: (error: any) => {
      toast.error(`Error al crear la categoría: ${error.message}`);
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryFormData }) => {
      const { data: updatedData, error } = await supabase
        .from("categories")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updatedData as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoría actualizada exitosamente");
    },
    onError: (error: any) => {
      toast.error(`Error al actualizar la categoría: ${error.message}`);
    },
  });

  const updateCategoryStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "inactive" }) => {
      const { data, error } = await supabase
        .from("categories")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Category;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(`Categoría ${data.status === "active" ? "activada" : "desactivada"} exitosamente`);
    },
    onError: (error: any) => {
      toast.error(`Error al cambiar el estado de la categoría: ${error.message}`);
    },
  });

  return {
    categories: data?.categories || [],
    totalCount: data?.count || 0,
    pageCount: Math.ceil((data?.count || 0) / pageSize),
    page,
    pageSize,
    isLoading,
    error,
    setPage,
    setPageSize,
    createCategory,
    updateCategory,
    updateCategoryStatus,
  };
}
