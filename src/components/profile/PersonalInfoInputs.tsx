
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  status: string;
}

interface PersonalInfoInputsProps {
  formData: {
    birth_date: string;
    country_of_residence: string;
    state_of_residence: string;
    country_code: string;
    phone_number: string;
    category_id: string;
    gender: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  COUNTRIES: Array<{ label: string; value: string; code: string }>;
  GENDERS: Array<{ label: string; value: string }>;
  categories: Category[];
  categoriesLoading: boolean;
}

export const PersonalInfoInputs = ({
  formData,
  handleInputChange,
  handleSelectChange,
  COUNTRIES,
  GENDERS,
  categories,
  categoriesLoading,
}: PersonalInfoInputsProps) => {
  // Filtrar datos vacíos y validar arrays
  const validCountries = COUNTRIES?.filter(country => country?.value && country?.code) ?? [];
  const validGenders = GENDERS?.filter(gender => gender?.value) ?? [];
  const validCategories = categories?.filter(category => category?.id && category?.name) ?? [];

  // Log for debugging
  console.log("Categories in PersonalInfoInputs:", validCategories);
  console.log("Selected category_id:", formData.category_id);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
        <Input
          id="birth_date"
          name="birth_date"
          type="date"
          value={formData.birth_date || ''}
          onChange={handleInputChange}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="country_of_residence">País de Residencia</Label>
        <Select 
          value={formData.country_of_residence || ''} 
          onValueChange={(value) => handleSelectChange("country_of_residence", value)}
        >
          <SelectTrigger className="w-full">
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
          value={formData.state_of_residence || ''}
          onChange={handleInputChange}
          placeholder="Ingresa tu estado de residencia"
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country_code">País (Código)</Label>
          <Select
            value={formData.country_code || ''}
            onValueChange={(value) => handleSelectChange("country_code", value)}
          >
            <SelectTrigger className="w-full">
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
            value={formData.phone_number || ''}
            onChange={handleInputChange}
            placeholder="Ingresa tu número de teléfono"
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category_id">Categoría</Label>
        <Select 
          value={formData.category_id || ''} 
          onValueChange={(value) => handleSelectChange("category_id", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona tu categoría" />
          </SelectTrigger>
          <SelectContent>
            {categoriesLoading ? (
              <SelectItem value="loading" disabled>Cargando categorías...</SelectItem>
            ) : (
              validCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Género</Label>
        <Select 
          value={formData.gender || ''} 
          onValueChange={(value) => handleSelectChange("gender", value)}
        >
          <SelectTrigger className="w-full">
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
