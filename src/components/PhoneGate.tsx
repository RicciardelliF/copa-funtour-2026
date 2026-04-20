'use client';

import { useState } from 'react';

type Props = {
  onSubmit: (phone: string) => Promise<void>;
  loading: boolean;
};

export function PhoneGate({ onSubmit, loading }: Props) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 8) {
      setError('Introduce un teléfono válido');
      return;
    }
    setError(null);
    await onSubmit(phone);
  }

  return (
    <form onSubmit={handle} className="space-y-5">
      <div className="text-center">
        <h2 className="font-display text-2xl font-extrabold">¡Vamos allá!</h2>
        <p className="mt-1 text-sm text-ink/60">
          Entra o inscríbete con tu teléfono. Es la forma más rápida y así puedes editar tu equipo desde cualquier móvil.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold">Teléfono del capitán</label>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className={`input ${error ? 'input-error' : ''}`}
          placeholder="+34 600 00 00 00"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
        <p className="mt-2 text-xs text-ink/50">
          Usaremos tu teléfono solo para identificarte en el torneo. Nada de spam, palabra.
        </p>
      </div>

      <button className="btn-primary w-full" disabled={loading}>
        {loading ? 'Buscando...' : 'Continuar'}
      </button>
    </form>
  );
}
