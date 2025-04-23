
interface CountryCode {
  name: string;
  code: string;
}

export const countryPhoneCodes: CountryCode[] = [
  { name: "Estados Unidos", code: "+1" },
  { name: "México", code: "+52" },
  { name: "Colombia", code: "+57" },
  { name: "Argentina", code: "+54" },
  { name: "Chile", code: "+56" },
  { name: "Perú", code: "+51" },
  { name: "Otro", code: "custom" },
];
