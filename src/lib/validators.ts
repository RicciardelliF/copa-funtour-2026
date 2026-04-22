import { z } from 'zod';
import { isValidSpanishCity } from './spanish-cities';

export const SPORTS = ['football', 'volleyball'] as const;
export type Sport = (typeof SPORTS)[number];

export const SPORT_LABELS: Record<Sport, string> = {
  football: 'Fútbol',
  volleyball: 'Vóley',
};

export const SPORT_MIN_PLAYERS: Record<Sport, number> = {
  football: 4, // 3 + portero
  volleyball: 6,
};

/**
 * Campo ciudad compartido: solo acepta municipios oficiales de España
 * (comparación normalizada, sin acentos y case-insensitive).
 */
const spanishCityField = z
  .string()
  .trim()
  .min(2, 'La ciudad es muy corta')
  .max(60, 'La ciudad es demasiado larga')
  .refine(isValidSpanishCity, {
    message: 'Debe ser una ciudad de España (elige una de la lista)',
  });

export const registrationSchema = z.object({
  captain: z
    .string()
    .trim()
    .min(2, 'El nombre del capitán es muy corto')
    .max(80, 'El nombre es demasiado largo'),
  teamName: z
    .string()
    .trim()
    .min(2, 'El nombre del equipo es muy corto')
    .max(60, 'El nombre del equipo es demasiado largo'),
  city: spanishCityField,
  phone: z.string().trim().min(6, 'Teléfono inválido'),
  sports: z
    .array(z.enum(SPORTS))
    .min(1, 'Elige al menos un deporte'),
  // Confirmación explícita de que cumple el mínimo de jugadores (por cada deporte elegido)
  minPlayersConfirmed: z.literal(true, {
    errorMap: () => ({
      message: 'Debes confirmar que tu equipo cumple el mínimo de jugadores',
    }),
  }),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

// Para edición aceptamos el mismo shape
export const registrationEditSchema = registrationSchema;

export const adminLoginSchema = z.object({
  password: z.string().min(1, 'Introduce la contraseña'),
});

export const adminEditSchema = z.object({
  captain: z.string().trim().min(2).max(80),
  teamName: z.string().trim().min(2).max(60),
  city: spanishCityField,
  phone: z.string().trim().min(6),
  sports: z.array(z.enum(SPORTS)).min(1),
});
