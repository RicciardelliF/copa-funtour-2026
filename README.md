# Copa FunTour 2026

App web responsive de inscripciones para la Copa FunTour 2026 (fútbol + vóley), pensada mobile-first, con persistencia central, integración con Google Sheets y panel admin.

## ✨ Features

- Inscripción por **teléfono como identificador único** (sin contraseñas, sin OTP).
- Si el teléfono ya existe, recupera la inscripción desde **cualquier dispositivo**.
- Un usuario puede apuntarse a **fútbol, vóley o ambos**.
- Edición posterior (capitán, equipo, ciudad, teléfono, deportes).
- **Vista pública FOMO** (solo equipo + ciudad, sin revelar deporte) con buscador.
- **Panel admin** protegido por contraseña (stats, filtros, editar/borrar, export CSV, resync).
- **Integración con Google Sheets** vía Service Account (server-side, sin exponer credenciales).

## 🧱 Stack

- **Next.js 14** (App Router, TypeScript) — full-stack en un solo repo, server components + API routes.
- **Prisma** + **SQLite** (dev) / **PostgreSQL** (prod, p. ej. Neon) — tipado, migraciones, simple.
- **Tailwind CSS** — utility-first, responsive, cero setup extra.
- **Zod** — validación de entrada compartida entre cliente y servidor.
- **jose** — firma de cookie de sesión admin (JWT HS256).
- **googleapis** — cliente oficial para la Google Sheets API.
- **Vercel** — deploy en 1 click.

## 🚀 Ejecución en local

Requisitos: Node 18.17+.

```bash
npm install
cp .env.example .env.local
# edita .env.local (DATABASE_URL queda en SQLite, GOOGLE_* opcionales para dev)

# Inicializa la DB
npm run db:push

# Arranca dev server
npm run dev
```

Abre http://localhost:3000.
- `/` → landing + inscripción por teléfono
- `/equipos` → vista pública FOMO
- `/admin` → panel admin (clave: `Mardelplata!2017`)

## 🗄️ Base de datos

Decisión de modelado (ver `prisma/schema.prisma`):

- **`Registration`** es la entidad de dominio, identificada por `phone` único.
- **`RegistrationSport`** es una tabla hija con los deportes en los que está apuntada. Permite 0..N filas pero con `@@unique([registrationId, sport])` para evitar duplicados del mismo deporte por equipo.

Esto deja limpio:
- "1 equipo de fútbol y/o 1 de vóley por teléfono" → 1 `Registration` + 1 o 2 `RegistrationSport`.
- En Google Sheets cada `RegistrationSport` se proyecta como una fila independiente.

Para producción cambia el datasource a Postgres:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Y usa `DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"` (Neon/Supabase/Railway).

## ☁️ Deploy en Vercel (recomendado)

1. Crea una DB Postgres gratis en [Neon](https://neon.tech) o [Supabase](https://supabase.com).
2. Edita `prisma/schema.prisma` → `provider = "postgresql"`.
3. Crea una migración local apuntando a Neon: `npm run db:migrate -- --name init`.
4. Sube a GitHub y conecta el repo en Vercel.
5. Variables de entorno en Vercel (`Settings → Environment Variables`):
   - `DATABASE_URL`
   - `ADMIN_PASSWORD` = `Mardelplata!2017`
   - `AUTH_SECRET` (genera con `openssl rand -base64 48`)
   - `GOOGLE_SHEETS_ID`, `GOOGLE_SHEETS_TAB`, `GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`
   - `NEXT_PUBLIC_APP_URL` = tu dominio final
6. Deploy. El `postinstall` no está activo; el build ejecuta `prisma generate && prisma migrate deploy && next build`.

## 🧾 Google Sheets

Instrucciones paso a paso en [`docs/GOOGLE_SHEETS_SETUP.md`](docs/GOOGLE_SHEETS_SETUP.md).

**Resumen**:
- Crea Service Account → genera key JSON.
- Comparte el Sheet con el email de la service account (rol Editor).
- Pega el email y la private key en variables de entorno.
- La app se encarga del resto (escritura, edición, borrado, reconciliación).

## 🔐 Seguridad del admin

- La contraseña (`Mardelplata!2017`) se compara en servidor (comparación en tiempo constante).
- Al acertar, se firma un JWT con `AUTH_SECRET` y se guarda en una cookie `HttpOnly`, `SameSite=Lax`, `Secure` en prod, con expiración 8h.
- Las rutas `/api/admin/*` verifican la cookie en cada request.
- El middleware redirige a `/admin/login` si no hay cookie.

### Limitaciones y mejoras recomendadas

Una contraseña fija compartida es simple pero:
- no hay auditoría por persona,
- si se filtra hay que cambiar el env var y redeploy,
- nada evita ataques de fuerza bruta sofisticados (hay un retraso básico de 400ms).

**Mejoras posibles** (sin cambiar tu requisito):
- Añadir rate-limit por IP (p. ej. con Upstash Redis).
- Logs de acceso admin.
- Si algún día quieres cuentas por administrador, el modelo Admin se añade en 15 minutos.

## 📜 Scripts

| Script                    | Descripción                                          |
| ------------------------- | ---------------------------------------------------- |
| `npm run dev`             | Servidor de desarrollo                               |
| `npm run build`           | Build de producción (incluye `prisma migrate deploy`) |
| `npm run start`           | Arranca el build de producción                       |
| `npm run db:push`         | Aplica el schema sin migraciones (útil en dev)       |
| `npm run db:migrate`      | Crea/aplica una migración con Prisma                 |
| `npm run db:studio`       | Abre Prisma Studio (UI para la DB)                   |
| `npm run sheets:resync`   | Resync completo de la hoja desde la DB               |

## 🗺️ Estructura

```
copa-funtour-2026/
├── prisma/schema.prisma
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Home (landing + inscripción)
│   │   ├── equipos/page.tsx         # Vista pública FOMO
│   │   ├── admin/page.tsx           # Dashboard admin
│   │   ├── admin/login/page.tsx     # Login admin
│   │   ├── admin/AdminDashboard.tsx # UI cliente del admin
│   │   └── api/
│   │       ├── registrations/route.ts
│   │       ├── registrations/lookup/route.ts
│   │       ├── public/teams/route.ts
│   │       └── admin/
│   │           ├── login/route.ts
│   │           ├── logout/route.ts
│   │           ├── registrations/route.ts
│   │           ├── registrations/[id]/route.ts
│   │           ├── export/route.ts
│   │           └── resync/route.ts
│   ├── components/
│   │   ├── Logo.tsx
│   │   ├── PhoneGate.tsx
│   │   ├── RegistrationForm.tsx
│   │   └── Toast.tsx
│   ├── lib/
│   │   ├── auth.ts          # Sesión admin (JWT en cookie HttpOnly)
│   │   ├── db.ts            # Prisma client singleton
│   │   ├── phone.ts         # Normalización de teléfonos
│   │   ├── registrations.ts # Servicio: DB + sync a Sheets
│   │   ├── sheets.ts        # Cliente Google Sheets API
│   │   └── validators.ts    # Schemas Zod + enums
│   └── middleware.ts        # Guardia de /admin
├── scripts/resync.ts        # CLI: resync completo
├── docs/GOOGLE_SHEETS_SETUP.md
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

## 🎨 Branding

Sustituye el componente `<Logo />` en `src/components/Logo.tsx` por el SVG/PNG de FunTour.
Ajusta los HEX de la paleta en `tailwind.config.ts` (sección `colors.brand` y `colors.ocean`) si el PDF de marca pide otros valores exactos.
