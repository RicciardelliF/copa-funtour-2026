/**
 * Normalización y validación de teléfonos.
 *
 * Estrategia: guardamos SIEMPRE una forma canónica (solo dígitos, con
 * prefijo internacional si el usuario lo escribió). Así el mismo número
 * escrito con o sin espacios/guiones/paréntesis se empata siempre.
 *
 * Reglas:
 * - Eliminamos todo lo que no sea dígito, excepto un '+' inicial.
 * - Si no empieza por '+', se asume prefijo España (+34) por defecto
 *   (puedes cambiarlo más abajo si tu público es de otro país).
 * - Tras normalizar, el número canónico es solo dígitos (sin '+').
 */

const DEFAULT_COUNTRY_PREFIX = '34'; // España. Cambia a '52' (MX), '54' (AR), '57' (CO), etc. si prefieres.

export function normalizePhone(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';
  if (hasPlus) return digits;
  // Evita doble prefijo: si ya empieza con el prefijo por defecto y tiene longitud razonable, respetar
  if (digits.startsWith(DEFAULT_COUNTRY_PREFIX) && digits.length >= 11) return digits;
  return DEFAULT_COUNTRY_PREFIX + digits;
}

export function isValidPhone(input: string): boolean {
  const normalized = normalizePhone(input);
  // Entre 8 y 15 dígitos (ITU-T E.164)
  return normalized.length >= 8 && normalized.length <= 15;
}

export function formatPhoneForDisplay(canonical: string): string {
  if (!canonical) return '';
  return '+' + canonical;
}
