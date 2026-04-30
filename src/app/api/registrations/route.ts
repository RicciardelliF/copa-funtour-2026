import { NextRequest, NextResponse } from 'next/server';
import { registrationSchema } from '@/lib/validators';
import { findByPhone, upsertByPhone } from '@/lib/registrations';
import { isValidPhone, normalizePhone } from '@/lib/phone';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/registrations — crea o actualiza por teléfono
export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (!isValidPhone(parsed.data.phone)) {
    return NextResponse.json({ error: 'Teléfono inválido' }, { status: 400 });
  }

  try {
    // Auto-asignación equitativa para '7 y 10 Jun':
    // El usuario elige "7 y 10 Jun" pero el sistema le asigna "7 Jun" o "10 Jun"
    // según cuál tenga menos equipos en ese momento.
    let assignedWeek = parsed.data.week;
    if (assignedWeek === '7 y 10 Jun') {
      const [count7, count10] = await Promise.all([
        prisma.registration.count({ where: { week: '7 Jun' } }),
        prisma.registration.count({ where: { week: '10 Jun' } }),
      ]);
      assignedWeek = count7 <= count10 ? '7 Jun' : '10 Jun';
    }

    const dto = await upsertByPhone({
      phone: parsed.data.phone,
      captain: parsed.data.captain,
      teamName: parsed.data.teamName,
      city: parsed.data.city,
      localizador: parsed.data.localizador,
      week: assignedWeek,
      sports: parsed.data.sports,
    });
    return NextResponse.json({ registration: dto });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message ?? 'Error guardando' }, { status: 500 });
  }
}

// DELETE /api/registrations?phone=+34... — permite al propio usuario darse de baja
export async function DELETE(req: NextRequest) {
  const rawPhone = req.nextUrl.searchParams.get('phone') ?? '';
  if (!isValidPhone(rawPhone)) {
    return NextResponse.json({ error: 'Teléfono inválido' }, { status: 400 });
  }
  const phone = normalizePhone(rawPhone);
  const reg = await prisma.registration.findUnique({ where: { phone } });
  if (!reg) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  const { deleteById } = await import('@/lib/registrations');
  await deleteById(reg.id);
  return NextResponse.json({ ok: true });
}
