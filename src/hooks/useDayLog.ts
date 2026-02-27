import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { DayLog } from '../types';

const emptyLog = (date: string): DayLog => ({
  date,
  flowLevel: 'none',
  symptomsDefault: [],
  symptomsCustom: [],
  mood: '',
  note: '',
});

export function useDayLog(date: string) {
  const log = useLiveQuery(() => db.dailyLogs.get(date), [date]);

  const data: DayLog = log ?? emptyLog(date);

  async function save(partial: Partial<DayLog>) {
    await db.dailyLogs.put({ ...data, ...partial, date });
  }

  return { data, save, loading: log === undefined };
}

export function useDayLogs(startDate: string, endDate: string) {
  const logs = useLiveQuery(
    () =>
      db.dailyLogs
        .where('date')
        .between(startDate, endDate, true, true)
        .toArray(),
    [startDate, endDate],
  );

  const map = new Map<string, DayLog>();
  if (logs) {
    for (const l of logs) map.set(l.date, l);
  }

  return { logs: map, loading: logs === undefined };
}
