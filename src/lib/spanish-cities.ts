/**
 * Lista oficial de las 50 provincias espanolas.
 * Fuente: INE (Instituto Nacional de Estadistica).
 * Se incluyen las denominaciones bilingues oficiales para las provincias con lengua cooficial.
 */
export const SPANISH_PROVINCES = [
  'Álava',
  'Albacete',
  'Alicante',
  'Almería',
  'Asturias',
  'Ávila',
  'Badajoz',
  'Baleares',
  'Barcelona',
  'Burgos',
  'Cáceres',
  'Cádiz',
  'Cantabria',
  'Castellón',
  'Ciudad Real',
  'Córdoba',
  'Cuenca',
  'Gerona / Girona',
  'Granada',
  'Guadalajara',
  'Gipúzkoa / Guipúzcoa',
  'Huelva',
  'Huesca',
  'Jaén',
  'La Coruña / A Coruña',
  'La Rioja',
  'Las Palmas',
  'León',
  'Lérida / Lleida',
  'Lugo',
  'Madrid',
  'Málaga',
  'Murcia',
  'Navarra',
  'Orense / Ourense',
  'Palencia',
  'Pontevedra',
  'Salamanca',
  'Santa Cruz de Tenerife',
  'Segovia',
  'Sevilla',
  'Soria',
  'Tarragona',
  'Teruel',
  'Toledo',
  'Valencia',
  'Valladolid',
  'Vizcaya',
  'Zamora',
  'Zaragoza',
] as const;

/** Alias de compatibilidad — los componentes existentes siguen funcionando. */
export const SPANISH_CITIES = SPANISH_PROVINCES;

export type SpanishProvince = (typeof SPANISH_PROVINCES)[number];
export type SpanishCity = SpanishProvince;

export function isValidSpanishProvince(value: string): boolean {
  return (SPANISH_PROVINCES as readonly string[]).includes(value);
}

/** Alias de compatibilidad. */
export function isValidSpanishCity(value: string): boolean {
  return isValidSpanishProvince(value);
}
