import { db } from '../db/database';
import { APP_VERSION } from './constants';

interface ExportData {
  version: number;
  appVersion: string;
  exportedAt: string;
  settings: { key: string; value: string | number }[];
  dailyLogs: unknown[];
  customSymptoms: unknown[];
}

export async function exportData(): Promise<void> {
  const settings = await db.settings.toArray();
  const dailyLogs = await db.dailyLogs.toArray();
  const customSymptoms = await db.customSymptoms.toArray();

  const data: ExportData = {
    version: 1,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    settings,
    dailyLogs,
    customSymptoms,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10);

  const a = document.createElement('a');
  a.href = url;
  a.download = `lunamia-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(file: File): Promise<{ success: boolean; error?: string }> {
  try {
    const text = await file.text();
    const data: ExportData = JSON.parse(text);

    if (!data.version || !Array.isArray(data.dailyLogs) || !Array.isArray(data.settings)) {
      return { success: false, error: 'Format de fichier invalide.' };
    }

    await db.transaction('rw', db.settings, db.dailyLogs, db.customSymptoms, async () => {
      await db.settings.clear();
      await db.dailyLogs.clear();
      await db.customSymptoms.clear();

      if (data.settings.length > 0) await db.settings.bulkPut(data.settings);
      if (data.dailyLogs.length > 0) await db.dailyLogs.bulkPut(data.dailyLogs as never[]);
      if (data.customSymptoms?.length > 0)
        await db.customSymptoms.bulkPut(data.customSymptoms as never[]);
    });

    return { success: true };
  } catch {
    return { success: false, error: 'Impossible de lire le fichier.' };
  }
}

export async function resetAllData(): Promise<void> {
  await db.transaction('rw', db.settings, db.dailyLogs, db.customSymptoms, async () => {
    await db.settings.clear();
    await db.dailyLogs.clear();
    await db.customSymptoms.clear();
  });
}
