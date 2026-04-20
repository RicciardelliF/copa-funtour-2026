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
      // Extraemos el teléfono canónico que nos devuelve el servidor (o lo normalizamos aquí)
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
    <div className="min-h-dvh hero-bg">
      <TopBar />

      <main className="container-narrow pb-20 pt-6 sm:pt-12">
        {step === 'phone' && <HeroCard step="phone"><PhoneGate onSubmit={lookup} loading={loading} /></HeroCard>}

        {step === 'form' && (
          <HeroCard step="form">
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
          </HeroCard>
        )}

        {step === 'saved' && saved && (
          <HeroCard step="saved">
            <SavedView
              registration={saved}
              onEdit={() => {
                setExisting(saved);
                setStep('form');
              }}
            />
          </HeroCard>
        )}

        <PromoSection />
      </main>

      <Footer />
    </div>
  );
}

function TopBar() {
  return (
    <header className="container-wide flex items-center justify-between py-5">
      <Link href="/" className="flex items-center">
        <Logo />
      </Link>
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/equipos"
          className="rounded-full bg-white/70 px-4 py-2 font-semibold text-ink ring-1 ring-ink/10 hover:bg-white"
        >
          Equipos apuntados
        </Link>
      </nav>
    </header>
  );
}

function HeroCard({ step, children }: { step: Step; children: React.ReactNode }) {
  return (
    <section className="anim-fade-up">
      {step === 'phone' && (
        <div className="mb-6 text-center">
          <span className="chip-brand">🏆 Copa FunTour 2026</span>
          <h1 className="mt-3 font-display text-[40px] leading-none font-extrabold sm:text-5xl">
            Inscribe a tu equipo.
            <br />
            <span className="text-brand-500">Que empiece el torneo.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-ink/60">
            Fútbol, vóley o los dos. La Copa oficial del viaje de fin de curso.
          </p>
        </div>
      )}
      <div className="card">{children}</div>
    </section>
  );
}

function SavedView({ registration, onEdit }: { registration: Registration; onEdit: () => void }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-100 text-2xl">🎉</span>
        <div>
          <h2 className="font-display text-xl font-extrabold">¡Equipo guardado!</h2>
          <p className="text-sm text-ink/60">Tu inscripción está confirmada en la base de datos.</p>
        </div>
      </div>

      <dl className="divide-y divide-ink/5 rounded-2xl bg-paper p-4">
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
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-sm text-ink/60">{label}</dt>
      <dd className="text-right text-sm font-semibold">{value}</dd>
    </div>
  );
}

function PromoSection() {
  return (
    <section className="mt-10 grid gap-3 sm:grid-cols-3">
      <Feat
        emoji="⚽️"
        title="Fútbol"
        desc="Mínimo 4 jugadores (3 + portero). Partidos rapiditos, diversión garantizada."
      />
      <Feat
        emoji="🏐"
        title="Vóley"
        desc="Mínimo 6 jugadores. Saque, remate y mucha playa."
      />
      <Feat
        emoji="🏆"
        title="Doble"
        desc="¿Vais a por todo? Apúntate a los dos deportes desde una sola inscripción."
      />
    </section>
  );
}

function Feat({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white/70 p-4 ring-1 ring-ink/5">
      <div className="text-2xl">{emoji}</div>
      <h3 className="mt-1 font-display text-base font-bold">{title}</h3>
      <p className="mt-0.5 text-sm text-ink/60">{desc}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="container-wide pb-8 text-center text-xs text-ink/50">
      <p>© 2026 FunTour · Copa FunTour 2026 · Hecho con cariño para el viaje de fin de curso.</p>
    </footer>
  );
}
