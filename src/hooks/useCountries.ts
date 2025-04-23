
import { useQuery } from "@tanstack/react-query";
import { searchCountries, Country } from "@/services/countryService";

export { Country };

export const useCountries = (searchTerm: string = '') => {
  return useQuery({
    queryKey: ['countries', searchTerm],
    queryFn: () => searchCountries(searchTerm),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
