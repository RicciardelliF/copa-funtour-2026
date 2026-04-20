'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

type Team = { id: string; teamName: string; city: string; createdAt: string };

export default function EquiposPage() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    fetch('/api/public/teams')
      .then(r => r.json())
      .then(j => setTeams(j.teams ?? []))
      .catch(() => setTeams([]));
  }, []);

  const filtered = useMemo(() => {
    if (!teams) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return teams;
    return teams.filter(
      t => t.teamName.toLowerCase().includes(needle) || t.city.toLowerCase().includes(needle),
    );
  }, [teams, q]);

  return (
    <div className="min-h-dvh hero-bg">
      <header className="container-wide flex items-center justify-between py-5">
        <Link href="/"><Logo /></Link>
        <Link href="/" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-pop">
          Apuntarme
        </Link>
      </header>

      <main className="container-wide pb-20">
        <section className="anim-fade-up mb-6 text-center">
          <span className="chip-brand">
            <span className="live-dot mr-1 inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
            En vivo
          </span>
          <h1 className="mt-3 font-display text-[40px] leading-none font-extrabold sm:text-5xl">
            Equipos apuntados
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
            Estos son los valientes que ya han dado el paso. ¿Os sumáis?
            <br />
            <span className="text-ink/40">(Psst... no decimos en qué deporte 😏)</span>
          </p>
        </section>

        <section className="mx-auto max-w-xl">
          <div className="card sticky top-3 z-10 !p-3 backdrop-blur">
            <label className="relative block">
              <span className="sr-only">Buscar</span>
              <input
                type="search"
                className="input !py-3 pl-11"
                placeholder="Busca por equipo o ciudad"
                value={q}
                onChange={e => setQ(e.target.value)}
              />
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40">
                <SearchIcon />
              </span>
            </label>
          </div>

          <Stats count={teams?.length ?? null} filtered={filtered.length} showingSearch={!!q} />

          <ul className="mt-4 grid gap-2">
            {teams === null ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
            ) : filtered.length === 0 ? (
              <EmptyState hasSearch={!!q} />
            ) : (
              filtered.map((t, idx) => <TeamItem key={t.id} team={t} index={idx} />)
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}

function Stats({
  count,
  filtered,
  showingSearch,
}: {
  count: number | null;
  filtered: number;
  showingSearch: boolean;
}) {
  if (count === null) return null;
  return (
    <p className="mt-3 text-center text-xs text-ink/50">
      {showingSearch
        ? `${filtered} resultado${filtered === 1 ? '' : 's'} de ${count} equipo${count === 1 ? '' : 's'}`
        : `${count} equipo${count === 1 ? '' : 's'} ya apuntado${count === 1 ? '' : 's'}`}
    </p>
  );
}

function TeamItem({ team, index }: { team: Team; index: number }) {
  // Color del avatar derivado del nombre (determinista, simpático)
  const palette = ['bg-brand-500', 'bg-ocean-500', 'bg-sun-500', 'bg-emerald-500', 'bg-violet-500'];
  const color = palette[hash(team.teamName) % palette.length];
  const initials = team.teamName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <li
      className="anim-fade-up flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft ring-1 ring-ink/5"
      style={{ animationDelay: `${Math.min(index, 10) * 20}ms` }}
    >
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${color} font-display text-sm font-extrabold text-white`}>
        {initials || '🏆'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{team.teamName}</p>
        <p className="truncate text-xs text-ink/60">{team.city}</p>
      </div>
      <span className="chip-brand hidden sm:inline-flex">🔥 inscrito</span>
    </li>
  );
}

function Skeleton() {
  return (
    <li className="flex animate-pulse items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-ink/5">
      <span className="h-11 w-11 rounded-full bg-ink/10" />
      <div className="flex-1 space-y-2">
        <span className="block h-3 w-2/3 rounded bg-ink/10" />
        <span className="block h-2.5 w-1/3 rounded bg-ink/10" />
      </div>
    </li>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <li className="card text-center">
      {hasSearch ? (
        <>
          <p className="text-2xl">🔍</p>
          <p className="mt-2 font-semibold">Ningún equipo coincide</p>
          <p className="text-sm text-ink/60">Prueba con otro nombre o ciudad.</p>
        </>
      ) : (
        <>
          <p className="text-2xl">🏆</p>
          <p className="mt-2 font-semibold">¡Aún no hay equipos!</p>
          <p className="text-sm text-ink/60">Sé el primero en apuntarte.</p>
          <Link href="/" className="btn-primary mt-3 inline-flex">
            Apuntar mi equipo
          </Link>
        </>
      )}
    </li>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
