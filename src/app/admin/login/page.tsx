'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? 'No se pudo iniciar sesión');
      return;
    }
    router.replace('/admin');
    router.refresh();
  }

  return (
    <div className="min-h-dvh hero-bg">
      <header className="container-wide flex items-center py-5">
        <Link href="/" aria-label="Volver al inicio" className="inline-flex">
          <Logo />
        </Link>
      </header>
      <main className="container-narrow pt-8">
        <div className="card">
          <h1 className="font-display text-2xl font-extrabold">Panel de admin</h1>
          <p className="mt-1 text-sm text-ink/60">Introduce la contraseña para continuar.</p>
          <form onSubmit={submit} className="mt-5 space-y-3">
            <input
              type="password"
              className={`input ${error ? 'input-error' : ''}`}
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm font-semibold text-ocean-700 hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}
