
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PersonalInfoInputsProps {
  formData: {
    birth_date: string;
    country_of_residence: string;
    state_of_residence: string;
    country_code: string;
    phone_number: string;
    category: string;
    gender: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  COUNTRIES: Array<{ label: string; value: string; code: string }>;
  CATEGORIES: string[];
  GENDERS: Array<{ label: string; value: string }>;
}

export const PersonalInfoInputs = ({
  formData,
  handleInputChange,
  handleSelectChange,
  COUNTRIES,
  CATEGORIES,
  GENDERS,
}: PersonalInfoInputsProps) => {
  // Debug logs para verificar los datos
  console.log("Countries data:", COUNTRIES);
  console.log("Categories data:", CATEGORIES);
  console.log("Genders data:", GENDERS);

  // Filtrar datos vacíos
  const validCountries = COUNTRIES.filter(country => country.value && country.code);
  const validCategories = CATEGORIES.filter(Boolean);
  const validGenders = GENDERS.filter(gender => gender.value);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
        <Input
          id="birth_date"
          name="birth_date"
          type="date"
          value={formData.birth_date}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="country_of_residence">País de Residencia</Label>
        <Select 
          value={formData.country_of_residence || "default"} 
          onValueChange={(value) => handleSelectChange("country_of_residence", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona tu país de residencia" />
          </SelectTrigger>
          <SelectContent>
            {validCountries.map((country) => (
              <SelectItem key={country.value} value={country.value}>
                {country.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="state_of_residence">Estado de Residencia</Label>
        <Input
          id="state_of_residence"
          name="state_of_residence"
          value={formData.state_of_residence}
          onChange={handleInputChange}
          placeholder="Ingresa tu estado de residencia"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country_code">País (Código)</Label>
          <Select
            value={formData.country_code || "default"}
            onValueChange={(value) => handleSelectChange("country_code", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu país" />
            </SelectTrigger>
            <SelectContent>
              {validCountries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.label} ({country.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone_number">Número de Teléfono</Label>
          <Input
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleInputChange}
            placeholder="Ingresa tu número de teléfono"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoría</Label>
        <Select 
          value={formData.category || "default"} 
          onValueChange={(value) => handleSelectChange("category", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona tu categoría" />
          </SelectTrigger>
          <SelectContent>
            {validCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Género</Label>
        <Select 
          value={formData.gender || "default"} 
          onValueChange={(value) => handleSelectChange("gender", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona tu género" />
          </SelectTrigger>
          <SelectContent>
            {validGenders.map((gender) => (
              <SelectItem key={gender.value} value={gender.value}>
                {gender.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
