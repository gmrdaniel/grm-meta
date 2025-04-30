
import { useQuery } from "@tanstack/react-query";
import { searchCountries } from "@/services/project/countryService";
import type { Country } from "@/services/project/countryService";
import { useState, useEffect } from "react";

export type { Country };

export const useCountries = (searchTerm: string = '') => {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  
  // Update the debounced term when the search term changes
  useEffect(() => {
    console.log("useCountries hook received searchTerm:", searchTerm);
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  return useQuery({
    queryKey: ['countries', debouncedTerm],
    queryFn: () => searchCountries(debouncedTerm),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: true, // Always enabled to ensure countries are loaded
  });
};