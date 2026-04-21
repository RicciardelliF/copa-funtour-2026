'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { PhoneGate } from '@/components/PhoneGate';
import { RegistrationForm, Registration } from '@/components/RegistrationForm';
import { ToastProvider, useToast } from '@/components/Toast';
import { SPORT_LABELS, Sport } from '@/lib/validators';

export default function Page() {
  return (
    <ToastProvider>
      <Home />
    </ToastProvider>
  );
}

type Step = 'phone' | 'form' | 'saved';

function Home() {
  const toast = useToast();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [existing, setExisting] = useState<Registration | null>(null);
  const [saved, setSaved] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup(input: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/registrations/lookup?phone=${encodeURIComponent(input)}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast({ kind: 'error', title: 'Teléfono inválido', desc: j.error ?? 'Revísalo e inténtalo otra vez.' });
        return;
      }
      const j = await res.json();
      const canonical = j.registration?.phone ?? input.replace(/\D/g, '');
      setPhone(canonical);
      setExisting(j.registration);
      setStep('form');
      if (j.registration) {
        toast({
          kind: 'info',
          title: '¡Hola de nuevo!',
          desc: 'Hemos recuperado tu inscripción desde la base de datos.',
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col hero-bg">
      <TopBar />

      <main className="container-wide grid flex-1 items-center gap-6 py-3 lg:grid-cols-2 lg:gap-10 lg:py-4">
        <section className="anim-fade-up hidden lg:block">
          <span className="chip-brand">🏆 Copa FunTour 2026</span>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] xl:text-5xl">
            Inscribe a tu equipo.
            <br />
            <span className="text-brand-500">Que empiece el torneo.</span>
          </h1>
          <p className="mt-3 max-w-md text-sm text-ink/60">
            Fútbol, vóley o los dos. La Copa oficial del viaje de fin de curso.
          </p>
          <dl className="mt-6 grid grid-cols-3 gap-3">
            <Feat emoji="⚽️" title="Fútbol" desc="4+ jugadores" />
            <Feat emoji="🏐" title="Vóley" desc="6+ jugadores" />
            <Feat emoji="🏆" title="Doble" desc="Los dos" />
          </dl>
        </section>

        <section className="anim-fade-up mx-auto w-full max-w-md">
          <div className="mb-3 text-center lg:hidden">
            <span className="chip-brand">🏆 Copa FunTour 2026</span>
            <h1 className="mt-2 font-display text-[26px] leading-tight font-extrabold">
              Inscribe a tu equipo.{' '}
              <span className="text-brand-500">Que empiece el torneo.</span>
            </h1>
          </div>

          {step === 'phone' && (
            <div className="card">
              <PhoneGate onSubmit={lookup} loading={loading} />
            </div>
          )}
          {step === 'form' && (
            <div className="card">
              <RegistrationForm
                initialPhone={phone}
                existing={existing}
                onSaved={r => {
                  setSaved(r);
                  setStep('saved');
                }}
                onResetPhone={() => {
                  setExisting(null);
                  setStep('phone');
                }}
              />
            </div>
          )}
          {step === 'saved' && saved && (
            <div className="card">
              <SavedView
                registration={saved}
                onEdit={() => {
                  setExisting(saved);
                  setStep('form');
                }}
              />
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

function TopBar() {
  return (
    <header className="container-wide flex items-center justify-between py-3 sm:py-4">
      <Link href="/" className="flex items-center">
        <Logo />
      </Link>
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/equipos"
          className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-ink ring-1 ring-ink/10 hover:bg-white sm:px-4 sm:py-2 sm:text-sm"
        >
          Equipos apuntados
        </Link>
      </nav>
    </header>
  );
}

function SavedView({ registration, onEdit }: { registration: Registration; onEdit: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-xl">🎉</span>
        <div>
          <h2 className="font-display text-lg font-extrabold">¡Equipo guardado!</h2>
          <p className="text-xs text-ink/60">Tu inscripción está confirmada.</p>
        </div>
      </div>

      <dl className="divide-y divide-ink/5 rounded-2xl bg-paper p-3">
        <Row label="Equipo" value={registration.teamName} />
        <Row label="Capitán" value={registration.captain} />
        <Row label="Ciudad" value={registration.city} />
        <Row label="Teléfono" value={`+${registration.phone}`} />
        <Row
          label="Deportes"
          value={
            <span className="flex flex-wrap gap-1.5">
              {registration.sports.map(s => (
                <span key={s} className={s === 'football' ? 'chip-brand' : 'chip-ocean'}>
                  {SPORT_LABELS[s as Sport]}
                </span>
              ))}
            </span>
          }
        />
      </dl>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button onClick={onEdit} className="btn-ghost flex-1">
          Editar inscripción
        </button>
        <Link href="/equipos" className="btn-primary flex-1">
          Ver equipos apuntados →
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <dt className="text-xs text-ink/60">{label}</dt>
      <dd className="text-right text-sm font-semibold">{value}</dd>
    </div>
  );
}

function Feat({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-ink/5">
      <div className="text-xl">{emoji}</div>
      <dt className="mt-1 font-display text-sm font-bold">{title}</dt>
      <dd className="text-xs text-ink/60">{desc}</dd>
    </div>
  );
}

function Footer() {
  return (
    <footer className="container-wide flex flex-wrap items-center justify-between gap-2 py-3 text-[11px] text-ink/50 sm:text-xs">
      <p>© 2026 FunTour · Copa del viaje de fin de curso</p>
      <Link href="/admin" className="font-semibold text-ink/60 hover:text-brand-600">
        Panel admin →
      </Link>
    </footer>
  );
}

