
export interface Country {
  id: string;
  code: string;
  name_es: string;
  name_en: string;
  active: boolean;
}

const countries: Country[] = [
  { id: "1", code: "US", name_es: "Estados Unidos", name_en: "United States", active: true },
  { id: "2", code: "ES", name_es: "España", name_en: "Spain", active: true },
  { id: "3", code: "MX", name_es: "México", name_en: "Mexico", active: true },
  { id: "4", code: "AR", name_es: "Argentina", name_en: "Argentina", active: true },
  { id: "5", code: "CO", name_es: "Colombia", name_en: "Colombia", active: true },
  { id: "6", code: "PE", name_es: "Perú", name_en: "Peru", active: true },
  { id: "7", code: "CL", name_es: "Chile", name_en: "Chile", active: true },
];

export const getCountries = async (): Promise<Country[]> => {
  return countries;
};
