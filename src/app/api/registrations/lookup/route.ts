import { NextRequest, NextResponse } from 'next/server';
import { findByPhone } from '@/lib/registrations';
import { isValidPhone } from '@/lib/phone';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/registrations/lookup?phone=+34600000000
export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone') ?? '';
  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: 'Teléfono inválido' }, { status: 400 });
  }
  const existing = await findByPhone(phone);
  return NextResponse.json({ registration: existing });
}
