/**
 * Integración con Google Sheets vía Service Account.
 *
 * Estrategia de consistencia:
 *  - La base de datos es la FUENTE DE VERDAD.
 *  - Tras cada mutación (crear / editar / borrar) reconciliamos las filas
 *    de esa inscripción en el Sheet: borramos las que ya no corresponden y
 *    escribimos las que faltan. Sencillo, idempotente y sin duplicados.
 *  - La clave de cada fila es registro_id + deporte.
 *  - El Sheet incluye una columna técnica `registro_id` oculta al resto
 *    del mundo pero imprescindible para la reconciliación.
 *
 * Columnas (orden exacto):
 *   A: registro_id
 *   B: nombre          (capitán)
 *   C: ciudad
 *   D: telefono
 *   E: equipo          (nombre del equipo)
 *   F: deporte         ("Fútbol" | "Vóley")
 *   G: creado_en       (ISO)
 *   H: actualizado_en  (ISO)
 *   I: localizador
 */

import { google, sheets_v4 } from 'googleapis';
import type { Sport } from './validators';
import { SPORT_LABELS } from './validators';

const HEADER_ROW = [
  'registro_id',
  'nombre',
  'ciudad',
  'telefono',
  'equipo',
  'deporte',
  'creado_en',
  'actualizado_en',
  'localizador',
];

const COL_REGISTRO_ID = 0;
const COL_DEPORTE = 5;

export type SheetRow = {
  registroId: string;
  captain: string;
  city: string;
  phone: string;
  teamName: string;
  localizador?: string;
  sport: Sport;
  createdAt: string;
  updatedAt: string;
};

function isSheetsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SHEETS_ID &&
      process.env.GOOGLE_SHEETS_CLIENT_EMAIL &&
      process.env.GOOGLE_SHEETS_PRIVATE_KEY &&
      process.env.GOOGLE_SHEETS_TAB,
  );
}

function getClient(): sheets_v4.Sheets {
  const privateKey = (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

function spreadsheetId(): string {
  return process.env.GOOGLE_SHEETS_ID as string;
}

function tabName(): string {
  return process.env.GOOGLE_SHEETS_TAB as string;
}

function quotedTab(): string {
  return `'${tabName().replace(/'/g, "''")}`;
}

function sportToLabel(s: Sport): string {
  return SPORT_LABELS[s];
}

async function getSheetId(sheets: sheets_v4.Sheets): Promise<number> {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: spreadsheetId() });
  const sheet = meta.data.sheets?.find(s => s.properties?.title === tabName());
  if (!sheet || sheet.properties?.sheetId == null) {
    throw new Error(`No encuentro la pestaña "${tabName()}" en el Sheet`);
  }
  return sheet.properties.sheetId;
}

/**
 * Asegura que exista la fila de encabezados. Si no, la escribe.
 */
export async function ensureHeaders(): Promise<void> {
  if (!isSheetsConfigured()) return;
  const sheets = getClient();
  const range = `${quotedTab()}!A1:I1`;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range,
  });
  const current = res.data.values?.[0] ?? [];
  const isOk =
    current.length === HEADER_ROW.length &&
    current.every((v, i) => String(v).trim() === HEADER_ROW[i]);
  if (!isOk) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId(),
      range,
      valueInputOption: 'RAW',
      requestBody: { values: [HEADER_ROW] },
    });
  }
}

type Mapped = { rowIndex: number; sport: string };

async function findRowsByRegistroId(registroId: string): Promise<Mapped[]> {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `${quotedTab()}!A2:F`,
  });
  const rows = res.data.values ?? [];
  const matches: Mapped[] = [];
  rows.forEach((row, i) => {
    if (row[COL_REGISTRO_ID] === registroId) {
      matches.push({ rowIndex: i + 2, sport: String(row[COL_DEPORTE] ?? '') });
    }
  });
  return matches;
}

function rowValues(r: SheetRow): (string | number)[] {
  return [
    r.registroId,
    r.captain,
    r.city,
    "'" + r.phone, // prefix con ' para forzar texto en Sheets y conservar el '+'/ceros a la izquierda
    r.teamName,
    sportToLabel(r.sport),
    r.createdAt,
    r.updatedAt,
    r.localizador ?? '',
  ];
}

/**
 * Reconcilia las filas de una inscripción:
 *  - `desired`: filas que deberían existir tras la mutación (1 por deporte).
 *  - Borra de Sheet las filas de ese registroId que no estén en `desired`.
 *  - Actualiza las que coinciden en deporte.
 *  - Inserta las que falten.
 * Idempotente: puede re-ejecutarse sin producir duplicados.
 */
export async function reconcileRegistration(
  registroId: string,
  desired: SheetRow[],
): Promise<void> {
  if (!isSheetsConfigured()) return;
  await ensureHeaders();

  const sheets = getClient();
  const existing = await findRowsByRegistroId(registroId);
  const desiredBySport = new Map(desired.map(d => [sportToLabel(d.sport), d]));

  // 1. Filas a borrar (existen en Sheet pero no en desired) → batch delete en una request
  const toDelete = existing
    .filter(e => !desiredBySport.has(e.sport))
    .map(e => e.rowIndex)
    .sort((a, b) => b - a); // borra de abajo hacia arriba para no corromper índices

  if (toDelete.length > 0) {
    const sheetId = await getSheetId(sheets);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId(),
      requestBody: {
        requests: toDelete.map(rowIndex => ({
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            },
          },
        })),
      },
    });
  }

  // 2. Refresh de existentes tras el borrado
  const refreshed = await findRowsByRegistroId(registroId);
  const refreshedBySport = new Map(refreshed.map(e => [e.sport, e]));

  // 3. Actualizar las existentes (coinciden en deporte)
  const updatesData: { range: string; values: (string | number)[][] }[] = [];
  const newRows: SheetRow[] = [];

  for (const d of desired) {
    const label = sportToLabel(d.sport);
    const ex = refreshedBySport.get(label);
    if (ex) {
      updatesData.push({
        range: `${quotedTab()}!A${ex.rowIndex}:I${ex.rowIndex}`,
        values: [rowValues(d) as (string | number)[]],
      });
    } else {
      newRows.push(d);
    }
  }

  if (updatesData.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: spreadsheetId(),
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updatesData,
      },
    });
  }

  // 4. Insertar las nuevas (append al final)
  if (newRows.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId(),
      range: `${quotedTab()}!A:I`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: newRows.map(r => rowValues(r) as (string | number)[]) },
    });
  }
}

/**
 * Borra TODAS las filas con un registroId (usado cuando el admin borra el equipo entero).
 */
export async function deleteRegistration(registroId: string): Promise<void> {
  if (!isSheetsConfigured()) return;
  await reconcileRegistration(registroId, []);
}

/**
 * Limpia y reescribe TODA la hoja con el estado actual de la DB.
 * Útil como botón de "Resincronizar todo" en el panel admin y para recuperación ante inconsistencias.
 */
export async function fullResync(allRows: SheetRow[]): Promise<void> {
  if (!isSheetsConfigured()) return;
  const sheets = getClient();
  await ensureHeaders();
  // Borra todo debajo del header
  await sheets.spreadsheets.values.clear({
    spreadsheetId: spreadsheetId(),
    range: `${quotedTab()}!A2:I`,
  });
  if (allRows.length === 0) return;
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId(),
    range: `${quotedTab()}!A2:I${allRows.length + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: allRows.map(r => rowValues(r) as (string | number)[]) },
  });
}

export const sheetsConfigured = isSheetsConfigured;
