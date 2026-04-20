import { NextResponse } from 'next/server';
import { destroyAdminSession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST() {
  destroyAdminSession();
  return NextResponse.json({ ok: true });
}
