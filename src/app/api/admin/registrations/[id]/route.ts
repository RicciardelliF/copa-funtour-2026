import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { adminEditSchema } from '@/lib/validators';
import { deleteById, updateById } from '@/lib/registrations';
import { reconcileRegistration, deleteRegistration } from '@/lib/sheets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const json = await req.json().catch(() => null);
  const parsed = adminEditSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inv\u00e1lidos', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const dto = await updateById(params.id, parsed.data);
    reconcileRegistration(dto).catch(console.error);
    return NextResponse.json({ registration: dto });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Error guardando' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    await deleteById(params.id);
    deleteRegistration(params.id).catch(console.error);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Error borrando' }, { status: 500 });
  }
}
