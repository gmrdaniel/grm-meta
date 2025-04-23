
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCountries } from "@/hooks/useCountries";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface CountrySelectProps {
  onSelect: (countryId: string, phoneCode: string) => void;
  value?: string;
  className?: string;
  placeholder?: string;
}

export const CountrySelect = ({ onSelect, value, className, placeholder }: CountrySelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: countries = [], isLoading, error, isFetching } = useCountries(search);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Log the current state to debug
    console.log("CountrySelect state:", { 
      countries, 
      isLoading, 
      isFetching,
      error: error ? error.message : null,
      search,
      isMobile
    });
  }, [countries, isLoading, isFetching, error, search, isMobile]);
  
  const loadingMessage = isLoading || isFetching ? "Cargando países..." : null;
  const errorMessage = error ? "Error al cargar países" : null;
  const emptyMessage = !isLoading && !error && countries.length === 0 
    ? "No se encontraron países" 
    : null;
  
  const currentCountry = countries.find(country => country.id === value);

  // On mobile, we use a fullscreen popover that's easier to interact with
  if (isMobile) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
          >
            {currentCountry ? `${currentCountry.name_es} (+${currentCountry.phone_code})` : placeholder || "Seleccionar país"}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-screen p-0" align="start" sideOffset={0}>
          <Command className="w-full">
            <CommandInput
              placeholder="Buscar país..."
              value={search}
              onValueChange={(value) => {
                console.log("Search term updated:", value);
                setSearch(value);
              }}
              className="h-9"
              autoFocus={true}
            />
            <CommandList className="max-h-[300px] overflow-y-auto">
              {loadingMessage && <CommandEmpty>{loadingMessage}</CommandEmpty>}
              {errorMessage && <CommandEmpty>{errorMessage}</CommandEmpty>}
              {emptyMessage && <CommandEmpty>{emptyMessage}</CommandEmpty>}
              {!loadingMessage && !errorMessage && !emptyMessage && (
                <CommandGroup>
                  {countries.map((country) => (
                    <CommandItem
                      key={country.id}
                      value={country.id}
                      onSelect={() => {
                        console.log("Country selected:", country);
                        onSelect(country.id, country.phone_code);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === country.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {country.name_es} (+{country.phone_code})
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  // Desktop version uses the regular Select component with a search field
  return (
    <Select
      value={value}
      onValueChange={(countryId) => {
        const country = countries.find(c => c.id === countryId);
        if (country) {
          onSelect(countryId, country.phone_code);
        }
      }}
    >
      <SelectTrigger className={className} disabled={isLoading}>
        <SelectValue placeholder={isLoading ? "Cargando..." : (placeholder || "Seleccionar país")} />
      </SelectTrigger>
      <SelectContent>
        <Command>
          <CommandInput
            placeholder="Buscar país..."
            value={search}
            onValueChange={setSearch}
            className="h-9"
            autoFocus={true}
          />
          <CommandList>
            {loadingMessage && <CommandEmpty>{loadingMessage}</CommandEmpty>}
            {errorMessage && <CommandEmpty>{errorMessage}</CommandEmpty>}
            {emptyMessage && <CommandEmpty>{emptyMessage}</CommandEmpty>}
            {!loadingMessage && !errorMessage && !emptyMessage && (
              <CommandGroup>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name_es} (+{country.phone_code})
                  </SelectItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </SelectContent>
    </Select>
  );
};
