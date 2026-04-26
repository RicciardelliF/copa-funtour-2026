import { NextRequest, NextResponse } from 'next/server';
import { registrationSchema } from '@/lib/validators';
import { findByPhone, upsertByPhone } from '@/lib/registrations';
import { isValidPhone, normalizePhone } from '@/lib/phone';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/registrations â crea o actualiza por telÃ©fono
export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON invÃ¡lido' }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos invÃ¡lidos', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (!isValidPhone(parsed.data.phone)) {
    return NextResponse.json({ error: 'TelÃ©fono invÃ¡lido' }, { status: 400 });
  }

  try {
    const dto = await upsertByPhone({
      phone: parsed.data.phone,
      captain: parsed.data.captain,
      teamName: parsed.data.teamName,
      city: parsed.data.city,
      localizador: parsed.data.localizador,
      week: parsed.data.week,
      sports: parsed.data.sports,
    });
    return NextResponse.json({ registration: dto });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message ?? 'Error guardando' }, { status: 500 });
  }
}

// DELETE /api/registrations?phone=+34... â permite al propio usuario darse de baja
export async function DELETE(req: NextRequest) {
  const rawPhone = req.nextUrl.searchParams.get('phone') ?? '';
  if (!isValidPhone(rawPhone)) {
    return NextResponse.json({ error: 'TelÃ©fono invÃ¡lido' }, { status: 400 });
  }
  const phone = normalizePhone(rawPhone);
  const reg = await prisma.registration.findUnique({ where: { phone } });
  if (!reg) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  const { deleteById } = await import('@/lib/registrations');
  await deleteById(reg.id);
  return NextResponse.json({ ok: true });
}
