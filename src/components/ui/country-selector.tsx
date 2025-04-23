
import { Check, ChevronsUpDown } from "lucide-react"
import { useCallback, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { supabase } from "@/integrations/supabase/client"

interface Country {
  id: string;
  name_es: string;
  name_en: string;
  phone_code: string;
}

interface CountrySelectorProps {
  onSelect: (country: Country) => void;
  placeholder?: string;
  selectedCountry?: Country | null;
  type: 'phone' | 'residence';
}

export function CountrySelector({ onSelect, placeholder, selectedCountry, type }: CountrySelectorProps) {
  const [open, setOpen] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Load initial countries on first open
  useEffect(() => {
    if (open && countries.length === 0 && !loading) {
      searchCountries('');
    }
  }, [open]);

  const searchCountries = useCallback(async (term: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_countries', {
        search_term: term
      });
      
      if (error) throw error;
      
      if (data) {
        // Make sure we don't have duplicates
        const uniqueCountries = data.reduce((acc: Country[], current: Country) => {
          const isDuplicate = acc.find(item => item.id === current.id);
          if (!isDuplicate) {
            acc.push(current);
          }
          return acc;
        }, []);
        
        setCountries(uniqueCountries);
      }
    } catch (error) {
      console.error('Error searching countries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = (country: Country) => {
    onSelect(country);
    setOpen(false);
  };

  const displayValue = () => {
    if (!selectedCountry) return placeholder;
    
    return type === 'phone' 
      ? selectedCountry.phone_code 
      : selectedCountry.name_es;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {displayValue()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Buscar país..." 
            value={searchTerm}
            onValueChange={(value) => {
              setSearchTerm(value);
              searchCountries(value);
            }}
            className="h-9"
          />
          {loading && <p className="py-2 text-center text-sm">Cargando...</p>}
          {!loading && countries.length === 0 && (
            <CommandEmpty>No se encontraron países.</CommandEmpty>
          )}
          <CommandGroup className="max-h-60 overflow-auto">
            {countries.map((country) => (
              <CommandItem
                key={country.id}
                value={country.id}
                onSelect={() => handleSelect(country)}
                className="flex items-center"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedCountry?.id === country.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {type === 'phone' ? (
                  <span>{country.name_es} ({country.phone_code})</span>
                ) : (
                  country.name_es
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
