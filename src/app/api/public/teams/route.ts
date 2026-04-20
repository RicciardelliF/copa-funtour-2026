import { NextResponse } from 'next/server';
import { listPublic } from '@/lib/registrations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/public/teams → lista pública FOMO (sin deporte)
export async function GET() {
  const teams = await listPublic();
  return NextResponse.json({ teams });
}
