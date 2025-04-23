
import { Check, ChevronsUpDown } from "lucide-react"
import { useCallback, useState } from "react"
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

  const searchCountries = useCallback(async (searchTerm: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('search_countries', {
        search_term: searchTerm
      })
      if (error) throw error
      setCountries(data || [])
    } catch (error) {
      console.error('Error searching countries:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCountry ? (
            type === 'phone' ? selectedCountry.phone_code : selectedCountry.name_es
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Buscar país..." 
            onValueChange={searchCountries}
          />
          <CommandEmpty>No se encontraron países.</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {countries.map((country) => (
              <CommandItem
                key={country.id}
                value={country.id}
                onSelect={() => {
                  onSelect(country)
                  setOpen(false)
                }}
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
