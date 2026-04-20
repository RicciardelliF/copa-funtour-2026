# Integración con Google Sheets (Service Account)

Esta app escribe/edita/borra filas en tu hoja **Copa FunTour 2026** usando una _Service Account_ de Google Cloud. Las credenciales vivirán SOLO en el servidor (variables de entorno de Vercel / tu hosting). Nunca se exponen al navegador.

## 1. Crea un proyecto en Google Cloud

1. Entra en [Google Cloud Console](https://console.cloud.google.com/) con una cuenta con permisos (puede ser `facu.ricciardelli@funtourviajes.com` o cualquier otra).
2. Crea un nuevo proyecto llamado, por ejemplo, **Copa FunTour 2026**.
3. Selecciónalo como proyecto activo.

## 2. Habilita la API de Google Sheets

1. En el menú → `APIs & Services` → `Library`.
2. Busca **Google Sheets API** y pulsa **Enable**.

## 3. Crea la Service Account

1. Menú → `IAM & Admin` → `Service Accounts` → **Create service account**.
2. Nombre: `copa-funtour-sheets`. Descripción opcional.
3. En los permisos del proyecto **no hace falta añadir roles** (usaremos permisos a nivel de Sheet).
4. Termina el asistente y pulsa la service account recién creada.

## 4. Crea una clave JSON

1. Dentro de la service account → pestaña **Keys** → **Add key** → **Create new key** → **JSON** → **Create**.
2. Se descargará un archivo `*.json`. **Guárdalo en un lugar seguro** (no lo subas a Git).

Dentro del JSON verás dos campos que necesitas:

```json
{
  "client_email": "copa-funtour-sheets@tu-proyecto.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIB...\n-----END PRIVATE KEY-----\n"
}
```

## 5. Comparte el Sheet con la Service Account

1. Abre el Google Sheet: https://docs.google.com/spreadsheets/d/1qSVczfVZHu7HALGJIR2GUN1_Pt398L7Ju515UOb8pIw/edit
2. Pulsa **Compartir**.
3. Pega el `client_email` de la service account (ej. `copa-funtour-sheets@tu-proyecto.iam.gserviceaccount.com`).
4. Rol: **Editor**.
5. **Desmarca** "Notificar". Pulsa **Compartir**.

> Tu correo personal `facu.ricciardelli@funtourviajes.com` seguirá teniendo acceso humano normal. La service account es el usuario programático.

## 6. Configura las variables de entorno

En tu archivo `.env.local` (dev) y en Vercel (prod):

```env
GOOGLE_SHEETS_ID="1qSVczfVZHu7HALGJIR2GUN1_Pt398L7Ju515UOb8pIw"
GOOGLE_SHEETS_TAB="Copa FunTour 2026"
GOOGLE_SHEETS_CLIENT_EMAIL="copa-funtour-sheets@tu-proyecto.iam.gserviceaccount.com"
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIB...\n-----END PRIVATE KEY-----\n"
```

> **Importante con `GOOGLE_SHEETS_PRIVATE_KEY`**: pega la clave con los `\n` literales (no saltos de línea reales). La app los convierte a saltos reales automáticamente.

## 7. Estructura esperada del Sheet

La pestaña `Copa FunTour 2026` debe tener en la fila 1 los siguientes encabezados (la primera vez que la app escribe, los crea/corrige automáticamente):

| A            | B      | C      | D        | E      | F       | G         | H              |
| ------------ | ------ | ------ | -------- | ------ | ------- | --------- | -------------- |
| registro_id  | nombre | ciudad | telefono | equipo | deporte | creado_en | actualizado_en |

Reglas:
- Una fila por deporte. Si un equipo está apuntado a los dos, habrá 2 filas con el mismo `registro_id`.
- `deporte` será `"Fútbol"` o `"Vóley"`.
- La columna `registro_id` permite que la app reconcilie sin crear duplicados ni inconsistencias.

## 8. ¿Qué hace la app con el Sheet?

- **Alta**: al crear una inscripción, escribe 1 o 2 filas nuevas (1 por deporte).
- **Edición**: al editar, actualiza las filas existentes y añade/borra filas si cambiaron los deportes.
- **Baja**: al borrar un equipo (usuario o admin), elimina todas las filas con ese `registro_id`.
- **Resync**: desde el panel admin hay un botón **🔁 Resync Google Sheets** que reescribe la hoja entera desde la DB (útil si alguna sincronización falló por red).

La DB es la **fuente de verdad**. Si hay divergencia, se corrige con el botón de Resync.

## 9. Troubleshooting rápido

| Error                                    | Causa probable                                                                    |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| `403 The caller does not have permission` | No compartiste el Sheet con el email de la service account.                       |
| `No encuentro la pestaña "..."`          | El nombre de la pestaña no coincide exactamente con `GOOGLE_SHEETS_TAB`.          |
| `error:0909006C:PEM routines...`         | Formato de `GOOGLE_SHEETS_PRIVATE_KEY` incorrecto (olvidaste los `\n` literales). |
| Timeouts en Vercel                       | El endpoint de Resync tiene `maxDuration=60`; sube el plan si necesitas más.      |
