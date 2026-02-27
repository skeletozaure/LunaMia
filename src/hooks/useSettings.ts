import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH } from '../utils/constants';
import type { ThemeMode } from '../types';

export function useSettings() {
  const rows = useLiveQuery(() => db.settings.toArray());

  const map = new Map<string, string | number>();
  if (rows) {
    for (const r of rows) map.set(r.key, r.value);
  }

  const cycleLength = (map.get('cycleLength') as number) ?? DEFAULT_CYCLE_LENGTH;
  const periodLength = (map.get('periodLength') as number) ?? DEFAULT_PERIOD_LENGTH;
  const theme = (map.get('theme') as ThemeMode) ?? 'system';

  async function setSetting(key: string, value: string | number) {
    await db.settings.put({ key, value });
  }

  return { cycleLength, periodLength, theme, setSetting, loading: rows === undefined };
}
