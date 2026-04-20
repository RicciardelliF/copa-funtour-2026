// Script CLI: fuerza una resincronización completa de Google Sheets desde la DB.
// Útil como tarea de recuperación o al migrar entornos.
// Uso: npm run sheets:resync
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });
loadEnv(); // también .env

import { resyncAll } from '../src/lib/registrations';

async function main() {
  const res = await resyncAll();
  // eslint-disable-next-line no-console
  console.log(`✅ Sheets resincronizado. ${res.count} fila(s) escritas.`);
}

main().catch(err => {
  console.error('❌ Resync fallido:', err);
  process.exit(1);
});
