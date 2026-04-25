'use client';

import { useState } from 'react';
import { Sport, SPORT_LABELS, SPORT_MIN_PLAYERS } from '@/lib/validators';
import { useToast } from './Toast';

export type Registration = {
  id: string;
  phone: string;
  captain: string;
  teamName: string;
  city: string;
  localizador?: string;
  sports: Sport[];
};

type Props = {
  initialPhone: string;
  existing: Registration | null;
  onSaved: (r: Registration) => void;
  onResetPhone: () => void;
};

export function RegistrationForm({ initialPhone, existing, onSaved, onResetPhone }: Props) {
  const toast = useToast();
  const [captain, setCaptain] = useState(existing?.captain ?? '');
  const [teamName, setTeamName] = useState(existing?.teamName ?? '');
  const [city, setCity] = useState(existing?.city ?? '');
  const [localizador, setLocalizador] = useState(existing?.localizador ?? '');
  const [sports, setSports] = useState<Sport[]>(existing?.sports ?? []);
  const [minConfirmed, setMinConfirmed] = useState<boolean>(!!existing);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!existing;

  function toggleSport(s: Sport) {
    setSports(curr => (curr.includes(s) ? curr.filter(x => x !== s) : [...curr, s]));
    // Al cambiar deportes, se pide re-confirmar el mÃ­nimo
    setMinConfirmed(false);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (captain.trim().length < 2) e.captain = 'Pon el nombre del capitÃ¡n';
    if (teamName.trim().length < 2) e.teamName = 'Ponle un nombre a tu equipo';
    if (city.trim().length < 2) e.city = 'Â¿De quÃ© ciudad sois?';
    if (sports.length === 0) e.sports = 'Elige al menos un deporte';
    if (!minConfirmed) e.minConfirmed = 'Confirma que tenÃ©is jugadores suficientes';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: initialPhone,
          captain,
          teamName,
          city,
          localizador: localizador || undefined,
          sports,
          minPlayersConfirmed: true,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast({
          kind: 'error',
          title: 'No se pudo guardar',
          desc: j.error ?? 'Revisa los datos e intÃ©ntalo otra vez.',
        });
        return;
      }
      const j = await res.json();
      toast({
        kind: 'success',
        title: isEditing ? 'Â¡Actualizado!' : 'Â¡Equipo inscrito!',
        desc: isEditing ? 'Cambios guardados correctamente.' : 'Â¡Nos vemos en la cancha!',
      });
      onSaved(j.registration);
    } catch (err: any) {
      toast({ kind: 'error', title: 'Error de conexiÃ³n', desc: err.message });
    } finally {
      setSaving(false);
    }
  }

  const minPlayersText =
    sports.length === 0
      ? null
      : sports
          .map(s => `${SPORT_LABELS[s]}: mÃ­nimo ${SPORT_MIN_PLAYERS[s]} jugadores`)
          .join(' Â· ');

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <header className="text-center">
        <p className="text-sm text-ink/60">{isEditing ? 'EstÃ¡s editando tu inscripciÃ³n' : 'Terminemos la inscripciÃ³n'}</p>
        <h2 className="font-display text-2xl font-extrabold">
          {isEditing ? 'Â¡QuÃ© bueno verte de vuelta!' : 'Â¡A por ese torneo!'}
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          TelÃ©fono: <span className="font-semibold">+{initialPhone}</span>{' '}
          <button type="button" onClick={onResetPhone} className="text-brand-500 underline">
            cambiar
          </button>
        </p>
      </header>

      <Field label="Nombre del capitÃ¡n" error={errors.captain}>
        <input
          className={`input ${errors.captain ? 'input-error' : ''}`}
          value={captain}
          onChange={e => setCaptain(e.target.value)}
          placeholder="Laura PÃ©rez"
          autoComplete="name"
          maxLength={80}
        />
      </Field>

      <Field label="Nombre del equipo" error={errors.teamName}>
        <input
          className={`input ${errors.teamName ? 'input-error' : ''}`}
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
          placeholder="Los Invencibles"
          maxLength={60}
        />
      </Field>

      <Field label="Ciudad" error={errors.city}>
        <input
          className={`input ${errors.city ? 'input-error' : ''}`}
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="Madrid"
          maxLength={60}
        />
      </Field>

      <Field
        label="NÃºmero de localizador"
        hint="Tu nÃºmero de localizador estÃ¡ en la programaciÃ³n de las discotecas ð"
        error={errors.localizador}
      >
        <input
          className={`input ${errors.localizador ? 'input-error' : ''}`}
          value={localizador}
          onChange={e => setLocalizador(e.target.value)}
          placeholder="Ej: ABC-123"
          maxLength={20}
        />
      </Field>

      <div>
        <label className="mb-2 block text-sm font-semibold">Â¿A quÃ© os apuntÃ¡is?</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SportCard
            label="FÃºtbol"
            emoji="â½ï¸"
            detail="MÃ­nimo 4 jugadores (3 + portero)"
            active={sports.includes('football')}
            onClick={() => toggleSport('football')}
          />
          <SportCard
            label="VÃ³ley"
            emoji="ð"
            detail="MÃ­nimo 6 jugadores"
            active={sports.includes('volleyball')}
            onClick={() => toggleSport('volleyball')}
          />
        </div>
        {errors.sports && <p className="mt-2 text-sm text-red-600">{errors.sports}</p>}
        <p className="mt-2 text-xs text-ink/50">
          Puedes apuntarte a uno o a los dos. Si querÃ©is doble, Â¡a por todo!
        </p>
      </div>

      {sports.length > 0 && (
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
            minConfirmed ? 'border-brand-500 bg-brand-50' : errors.minConfirmed ? 'border-red-400' : 'border-ink/10 bg-white'
          }`}
        >
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 accent-brand-500"
            checked={minConfirmed}
            onChange={e => setMinConfirmed(e.target.checked)}
          />
          <span className="text-sm">
            Confirmo que mi equipo cumple los mÃ­nimos:{' '}
            <span className="font-semibold">{minPlayersText}</span>
          </span>
        </label>
      )}
      {errors.minConfirmed && <p className="text-sm text-red-600">{errors.minConfirmed}</p>}

      <button type="submit" className="btn-primary w-full" disabled={saving}>
        {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Â¡Inscribir equipo!'}
      </button>

      {isEditing && (
        <p className="text-center text-xs text-ink/50">
          Se ha encontrado tu inscripciÃ³n automÃ¡ticamente desde la base de datos. Puedes entrar con tu telÃ©fono
          desde cualquier mÃ³vil.
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-ink/50">{hint}</p>}
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function SportCard({
  label,
  emoji,
  detail,
  active,
  onClick,
}: {
  label: string;
  emoji: string;
  detail: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group relative flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
        active
          ? 'border-brand-500 bg-brand-50 shadow-pop'
          : 'border-ink/10 bg-white hover:border-brand-200 hover:bg-brand-50/40'
      }`}
    >
      <span className="text-3xl">{emoji}</span>
      <span className="flex-1">
        <span className="block font-display text-base font-bold">{label}</span>
        <span className="block text-xs text-ink/60">{detail}</span>
      </span>
      <span
        aria-hidden
        className={`h-5 w-5 shrink-0 rounded-full border-2 transition-colors ${
          active ? 'border-brand-500 bg-brand-500' : 'border-ink/20'
        }`}
      >
        {active && (
          <svg viewBox="0 0 20 20" className="h-full w-full text-white">
            <path d="M5 10l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.5" />
          </svg>
        )}
      </span>
    </button>
  );
}
