import { prisma } from './db';
import { reconcileRegistration, deleteRegistration as sheetsDelete, fullResync, SheetRow } from './sheets';
import { normalizePhone } from './phone';
import { Sport, SPORT_LABELS } from './validators';

export type RegistrationDTO = {
  id: string;
  phone: string;
  captain: string;
  teamName: string;
  city: string;
  sports: Sport[];
  createdAt: string;
  updatedAt: string;
};

function toDTO(r: any): RegistrationDTO {
  return {
    id: r.id,
    phone: r.phone,
    captain: r.captain,
    teamName: r.teamName,
    city: r.city,
    sports: (r.sports ?? []).map((s: any) => s.sport as Sport),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

function toSheetRows(r: RegistrationDTO): SheetRow[] {
  return r.sports.map(sport => ({
    registroId: r.id,
    captain: r.captain,
    city: r.city,
    phone: r.phone,
    teamName: r.teamName,
    sport,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

export async function findByPhone(rawPhone: string): Promise<RegistrationDTO | null> {
  const phone = normalizePhone(rawPhone);
  if (!phone) return null;
  const r = await prisma.registration.findUnique({
    where: { phone },
    include: { sports: true },
  });
  return r ? toDTO(r) : null;
}

export async function findById(id: string): Promise<RegistrationDTO | null> {
  const r = await prisma.registration.findUnique({
    where: { id },
    include: { sports: true },
  });
  return r ? toDTO(r) : null;
}

export type UpsertInput = {
  phone: string;
  captain: string;
  teamName: string;
  city: string;
  sports: Sport[];
};

/**
 * Crea o actualiza una inscripción por teléfono.
 * 1) Escribe en la DB (fuente de verdad).
 * 2) Reconcilia Google Sheets (best-effort, el error no rompe la operación principal).
 */
export async function upsertByPhone(input: UpsertInput): Promise<RegistrationDTO> {
  const phone = normalizePhone(input.phone);
  if (!phone) throw new Error('Teléfono inválido');

  const data = {
    captain: input.captain.trim(),
    teamName: input.teamName.trim(),
    city: input.city.trim(),
  };

  // Si ya existe, actualizamos. Si no, creamos.
  const existing = await prisma.registration.findUnique({ where: { phone } });

  let registration;
  if (existing) {
    await prisma.$transaction(async tx => {
      await tx.registration.update({ where: { phone }, data });
      // Reemplazamos deportes: borrar los que sobran y crear los que faltan
      const current = await tx.registrationSport.findMany({
        where: { registrationId: existing.id },
      });
      const currentSet = new Set(current.map(c => c.sport));
      const desiredSet = new Set(input.sports);

      const toRemove = current.filter(c => !desiredSet.has(c.sport as Sport));
      const toAdd = input.sports.filter(s => !currentSet.has(s));

      if (toRemove.length > 0) {
        await tx.registrationSport.deleteMany({
          where: { id: { in: toRemove.map(r => r.id) } },
        });
      }
      if (toAdd.length > 0) {
        await tx.registrationSport.createMany({
          data: toAdd.map(s => ({ registrationId: existing.id, sport: s })),
        });
      }
    });
    registration = await prisma.registration.findUniqueOrThrow({
      where: { phone },
      include: { sports: true },
    });
  } else {
    registration = await prisma.registration.create({
      data: {
        phone,
        ...data,
        sports: { create: input.sports.map(s => ({ sport: s })) },
      },
      include: { sports: true },
    });
  }

  const dto = toDTO(registration);

  // Sync con Sheets — best-effort. Logueamos errores pero no rompemos al usuario.
  try {
    await reconcileRegistration(dto.id, toSheetRows(dto));
  } catch (err) {
    console.error('[sheets] reconcile falló', err);
  }

  return dto;
}

/**
 * Actualiza una inscripción desde el admin (incluye cambio de teléfono).
 */
export async function updateById(
  id: string,
  input: UpsertInput,
): Promise<RegistrationDTO> {
  const phone = normalizePhone(input.phone);
  if (!phone) throw new Error('Teléfono inválido');

  // Validar unicidad de teléfono si se está cambiando
  const other = await prisma.registration.findUnique({ where: { phone } });
  if (other && other.id !== id) {
    throw new Error('Ese teléfono ya está registrado por otro equipo');
  }

  await prisma.$transaction(async tx => {
    await tx.registration.update({
      where: { id },
      data: {
        phone,
        captain: input.captain.trim(),
        teamName: input.teamName.trim(),
        city: input.city.trim(),
      },
    });
    const current = await tx.registrationSport.findMany({ where: { registrationId: id } });
    const currentSet = new Set(current.map(c => c.sport));
    const desiredSet = new Set(input.sports);

    const toRemove = current.filter(c => !desiredSet.has(c.sport as Sport));
    const toAdd = input.sports.filter(s => !currentSet.has(s));

    if (toRemove.length > 0) {
      await tx.registrationSport.deleteMany({ where: { id: { in: toRemove.map(r => r.id) } } });
    }
    if (toAdd.length > 0) {
      await tx.registrationSport.createMany({
        data: toAdd.map(s => ({ registrationId: id, sport: s })),
      });
    }
  });

  const registration = await prisma.registration.findUniqueOrThrow({
    where: { id },
    include: { sports: true },
  });
  const dto = toDTO(registration);

  try {
    await reconcileRegistration(dto.id, toSheetRows(dto));
  } catch (err) {
    console.error('[sheets] reconcile falló', err);
  }
  return dto;
}

export async function deleteById(id: string): Promise<void> {
  await prisma.registration.delete({ where: { id } });
  try {
    await sheetsDelete(id);
  } catch (err) {
    console.error('[sheets] delete falló', err);
  }
}

/**
 * Lista todas las inscripciones, ordenadas por fecha descendente.
 */
export async function listAll(): Promise<RegistrationDTO[]> {
  const rs = await prisma.registration.findMany({
    include: { sports: true },
    orderBy: { createdAt: 'desc' },
  });
  return rs.map(toDTO);
}

/**
 * Lista los equipos para la vista pública FOMO (sin deporte).
 */
export async function listPublic(): Promise<{ id: string; teamName: string; city: string; createdAt: string }[]> {
  const rs = await prisma.registration.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, teamName: true, city: true, createdAt: true },
  });
  return rs.map(r => ({
    id: r.id,
    teamName: r.teamName,
    city: r.city,
    createdAt: r.createdAt.toISOString(),
  }));
}

/**
 * Conteos por deporte.
 */
export async function counts(): Promise<{ football: number; volleyball: number; teams: number }> {
  const [football, volleyball, teams] = await Promise.all([
    prisma.registrationSport.count({ where: { sport: 'football' } }),
    prisma.registrationSport.count({ where: { sport: 'volleyball' } }),
    prisma.registration.count(),
  ]);
  return { football, volleyball, teams };
}

/**
 * CSV para exportar desde admin. Formato compatible con Excel (BOM + ; opcional).
 */
export async function exportCsv(): Promise<string> {
  const rows = await listAll();
  const header = ['registro_id', 'nombre', 'ciudad', 'telefono', 'equipo', 'deporte', 'creado_en', 'actualizado_en'];
  const lines: string[] = [header.join(',')];
  for (const r of rows) {
    for (const sport of r.sports) {
      lines.push(
        [
          r.id,
          csvEscape(r.captain),
          csvEscape(r.city),
          '+' + r.phone,
          csvEscape(r.teamName),
          SPORT_LABELS[sport],
          r.createdAt,
          r.updatedAt,
        ].join(','),
      );
    }
  }
  return '\uFEFF' + lines.join('\n');
}

function csvEscape(v: string): string {
  if (/[",\n;]/.test(v)) {
    return '"' + v.replace(/"/g, '""') + '"';
  }
  return v;
}

/**
 * Resincronización completa de Google Sheets desde la DB.
 */
export async function resyncAll(): Promise<{ ok: true; count: number }> {
  const all = await listAll();
  const rows: SheetRow[] = all.flatMap(r => toSheetRows(r));
  await fullResync(rows);
  return { ok: true, count: rows.length };
}
