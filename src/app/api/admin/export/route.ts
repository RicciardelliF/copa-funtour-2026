import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { exportCsv } from '@/lib/registrations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return new NextResponse('No autorizado', { status: 401 });
  }
  const csv = await exportCsv();
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="copa-funtour-2026-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
