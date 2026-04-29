import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { counts, listAll } from '@/lib/registrations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const [registrations, totals] = await Promise.all([listAll(), counts()]);
  return NextResponse.json({ registrations, counts: totals });
}

export async function DELETE() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    await db.registrationSport.deleteMany({});
    await db.registration.deleteMany({});
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
