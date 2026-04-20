'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { ToastProvider, useToast } from '@/components/Toast';
import { Sport, SPORT_LABELS } from '@/lib/validators';
import type { RegistrationDTO } from '@/lib/registrations';

type Counts = { football: number; volleyball: number; teams: number };
type Filter = 'all' | Sport;

type Props = {
  initialRegistrations: RegistrationDTO[];
  initialCounts: Counts;
};

export function AdminDashboard(props: Props) {
  return (
    <ToastProvider>
      <Dashboard {...props} />
    </ToastProvider>
  );
}

function Dashboard({ initialRegistrations, initialCounts }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [registrations, setRegistrations] = useState<RegistrationDTO[]>(initialRegistrations);
  const [counts, setCounts] = useState<Counts>(initialCounts);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<RegistrationDTO | null>(null);
  const [resyncing, setResyncing] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return registrations.filter(r => {
      if (filter !== 'all' && !r.sports.includes(filter)) return false;
      if (!needle) return true;
      return (
        r.teamName.toLowerCase().includes(needle) ||
        r.city.toLowerCase().includes(needle) ||
        r.captain.toLowerCase().includes(needle) ||
        r.phone.includes(needle)
      );
    });
  }, [registrations, filter, query]);

  async function refresh() {
    const res = await fetch('/api/admin/registrations');
    if (!res.ok) return;
    const j = await res.json();
    setRegistrations(j.registrations);
    setCounts(j.counts);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Seguro que quieres borrar este equipo? Se borrará también de Google Sheets.')) return;
    const res = await fetch(`/api/admin/registrations/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast({ kind: 'error', title: 'No se pudo borrar', desc: j.error });
      return;
    }
    toast({ kind: 'success', title: 'Equipo borrado' });
    await refresh();
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  async function handleResync() {
    setResyncing(true);
    const res = await fetch('/api/admin/resync', { method: 'POST' });
    setResyncing(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast({ kind: 'error', title: 'Resync fallido', desc: j.error });
      return;
    }
    const j = await res.json();
    toast({
      kind: 'success',
      title: 'Google Sheets actualizado',
      desc: `${j.count} fila${j.count === 1 ? '' : 's'} escritas.`,
    });
  }

  return (
    <div className="min-h-dvh bg-ink/[0.03]">
      <header className="sticky top-0 z-10 border-b border-ink/10 bg-white/85 backdrop-blur">
        <div className="container-wide flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Link href="/"><Logo /></Link>
            <span className="hidden chip-ocean sm:inline-flex">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/equipos" className="btn-ghost !py-2">Vista pública</Link>
            <button onClick={handleLogout} className="btn-ghost !py-2">Salir</button>
          </div>
        </div>
      </header>

      <main className="container-wide py-6">
        <section className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Equipos totales" value={counts.teams} color="bg-ink text-white" />
          <StatCard label="Inscritos en fútbol" value={counts.football} color="bg-brand-500 text-white" />
          <StatCard label="Inscritos en vóley" value={counts.volleyball} color="bg-ocean-600 text-white" />
        </section>

        <section className="mt-5 rounded-3xl bg-white p-4 shadow-soft ring-1 ring-ink/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>
                Todos <span className="ml-1 opacity-60">({registrations.length})</span>
              </FilterBtn>
              <FilterBtn active={filter === 'football'} onClick={() => setFilter('football')}>
                ⚽️ Fútbol <span className="ml-1 opacity-60">({counts.football})</span>
              </FilterBtn>
              <FilterBtn active={filter === 'volleyball'} onClick={() => setFilter('volleyball')}>
                🏐 Vóley <span className="ml-1 opacity-60">({counts.volleyball})</span>
              </FilterBtn>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="search"
                className="input !py-2 !text-sm"
                placeholder="Buscar equipo, ciudad, capitán o teléfono"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <a href="/api/admin/export" className="btn-ghost !py-2">⬇️ Exportar CSV</a>
            <button onClick={handleResync} disabled={resyncing} className="btn-ghost !py-2">
              {resyncing ? 'Resincronizando...' : '🔁 Resync Google Sheets'}
            </button>
          </div>
        </section>

        <section className="mt-4 overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-ink/5">
          <div className="hidden grid-cols-[1.4fr_1.2fr_1fr_1fr_1.2fr_auto] gap-3 border-b border-ink/5 bg-ink/[0.02] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink/50 md:grid">
            <span>Equipo</span>
            <span>Capitán</span>
            <span>Ciudad</span>
            <span>Teléfono</span>
            <span>Deportes</span>
            <span className="text-right">Acciones</span>
          </div>
          <ul className="divide-y divide-ink/5">
            {filtered.length === 0 ? (
              <li className="p-8 text-center text-sm text-ink/50">Sin resultados.</li>
            ) : (
              filtered.map(r => (
                <li
                  key={r.id}
                  className="grid grid-cols-1 gap-1 p-4 md:grid-cols-[1.4fr_1.2fr_1fr_1fr_1.2fr_auto] md:items-center md:gap-3"
                >
                  <div>
                    <p className="font-semibold">{r.teamName}</p>
                    <p className="text-xs text-ink/50 md:hidden">{r.captain} · {r.city}</p>
                  </div>
                  <div className="hidden text-sm text-ink/70 md:block">{r.captain}</div>
                  <div className="hidden text-sm text-ink/70 md:block">{r.city}</div>
                  <div className="hidden text-sm tabular-nums text-ink/70 md:block">+{r.phone}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {r.sports.map(s => (
                      <span key={s} className={s === 'football' ? 'chip-brand' : 'chip-ocean'}>
                        {SPORT_LABELS[s]}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-start gap-1.5 md:justify-end">
                    <button onClick={() => setEditing(r)} className="btn-ghost !py-1.5 !px-3 text-xs">Editar</button>
                    <button onClick={() => handleDelete(r.id)} className="btn-danger !py-1.5 !px-3 text-xs">Borrar</button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </main>

      {editing && (
        <EditModal
          registration={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await refresh();
            toast({ kind: 'success', title: 'Guardado' });
          }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-3xl ${color} px-5 py-4 shadow-soft`}>
      <p className="text-sm opacity-80">{label}</p>
      <p className="font-display text-4xl font-extrabold tabular-nums">{value}</p>
    </div>
  );
}

function FilterBtn({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
        active ? 'bg-ink text-white' : 'bg-ink/5 text-ink hover:bg-ink/10'
      }`}
    >
      {children}
    </button>
  );
}

function EditModal({
  registration,
  onClose,
  onSaved,
}: {
  registration: RegistrationDTO;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [captain, setCaptain] = useState(registration.captain);
  const [teamName, setTeamName] = useState(registration.teamName);
  const [city, setCity] = useState(registration.city);
  const [phone, setPhone] = useState('+' + registration.phone);
  const [sports, setSports] = useState<Sport[]>(registration.sports);
  const [saving, setSaving] = useState(false);

  function toggle(s: Sport) {
    setSports(curr => (curr.includes(s) ? curr.filter(x => x !== s) : [...curr, s]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sports.length === 0) {
      toast({ kind: 'error', title: 'Selecciona al menos un deporte' });
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/admin/registrations/${registration.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ captain, teamName, city, phone, sports }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast({ kind: 'error', title: 'Error guardando', desc: j.error });
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/50 p-3 sm:items-center">
      <div className="anim-fade-up w-full max-w-md rounded-3xl bg-white p-5 shadow-soft">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-extrabold">Editar equipo</h3>
            <p className="text-xs text-ink/50">ID: {registration.id}</p>
          </div>
          <button onClick={onClose} className="text-ink/40 hover:text-ink">✕</button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Capitán"><input className="input" value={captain} onChange={e => setCaptain(e.target.value)} /></Field>
          <Field label="Equipo"><input className="input" value={teamName} onChange={e => setTeamName(e.target.value)} /></Field>
          <Field label="Ciudad"><input className="input" value={city} onChange={e => setCity(e.target.value)} /></Field>
          <Field label="Teléfono"><input className="input" value={phone} onChange={e => setPhone(e.target.value)} /></Field>
          <div>
            <label className="mb-1 block text-sm font-semibold">Deportes</label>
            <div className="flex gap-2">
              <Toggle active={sports.includes('football')} onClick={() => toggle('football')}>⚽️ Fútbol</Toggle>
              <Toggle active={sports.includes('volleyball')} onClick={() => toggle('volleyball')}>🏐 Vóley</Toggle>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancelar</button>
            <button className="btn-primary flex-1" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-2xl border px-3 py-2 text-sm font-semibold transition-colors ${
        active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink/10 bg-white'
      }`}
    >
      {children}
    </button>
  );
}
