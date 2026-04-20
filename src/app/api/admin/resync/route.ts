import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { resyncAll } from '@/lib/registrations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const res = await resyncAll();
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Error al resincronizar' }, { status: 500 });
  }
}
