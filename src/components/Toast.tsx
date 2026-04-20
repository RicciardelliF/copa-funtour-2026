'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Toast = { id: number; kind: 'success' | 'error' | 'info'; title: string; desc?: string };

const Ctx = createContext<{ push: (t: Omit<Toast, 'id'>) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setItems(curr => [...curr, { ...t, id }]);
    setTimeout(() => setItems(curr => curr.filter(x => x.id !== id)), 4200);
  }, []);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-50 mx-auto flex w-full max-w-md flex-col items-stretch gap-2 px-3">
        {items.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto anim-fade-up rounded-2xl px-4 py-3 shadow-soft ring-1 ${
              t.kind === 'success'
                ? 'bg-white text-ink ring-emerald-500/20'
                : t.kind === 'error'
                  ? 'bg-white text-ink ring-red-500/20'
                  : 'bg-white text-ink ring-ocean-500/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-1 inline-block h-2 w-2 shrink-0 rounded-full ${
                  t.kind === 'success'
                    ? 'bg-emerald-500'
                    : t.kind === 'error'
                      ? 'bg-red-500'
                      : 'bg-ocean-500'
                }`}
              />
              <div className="min-w-0">
                <p className="font-semibold">{t.title}</p>
                {t.desc && <p className="mt-0.5 text-sm text-ink/70">{t.desc}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast fuera de ToastProvider');
  return ctx.push;
}
