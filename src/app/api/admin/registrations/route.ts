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
