import { NextRequest, NextResponse } from 'next/server';
import { adminLoginSchema } from '@/lib/validators';
import { checkAdminPassword, createAdminSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Falta la contraseña' }, { status: 400 });
  }

  // Rate limiting muy básico: pequeño delay para mitigar fuerza bruta
  await new Promise(r => setTimeout(r, 400));

  if (!checkAdminPassword(parsed.data.password)) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
