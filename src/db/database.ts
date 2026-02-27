import Dexie, { type EntityTable } from 'dexie';
import type { DayLog, CustomSymptom } from '../types';

interface SettingRecord {
  key: string;
  value: string | number;
}

export class LunaMiaDB extends Dexie {
  settings!: EntityTable<SettingRecord, 'key'>;
  dailyLogs!: EntityTable<DayLog, 'date'>;
  customSymptoms!: EntityTable<CustomSymptom, 'id'>;

  constructor() {
    super('LunaMiaDB');
    this.version(1).stores({
      settings: 'key',
      dailyLogs: 'date',
      customSymptoms: '++id, label',
    });
  }
}

export const db = new LunaMiaDB();
