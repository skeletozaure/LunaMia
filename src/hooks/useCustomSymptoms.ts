import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export function useCustomSymptoms() {
  const symptoms = useLiveQuery(() => db.customSymptoms.toArray());

  async function add(label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;
    const existing = await db.customSymptoms.where('label').equals(trimmed).first();
    if (existing) return;
    await db.customSymptoms.add({ label: trimmed, createdAt: new Date().toISOString() });
  }

  async function remove(id: number) {
    await db.customSymptoms.delete(id);
  }

  return { symptoms: symptoms ?? [], add, remove, loading: symptoms === undefined };
}
