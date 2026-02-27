export type FlowLevel = 'none' | 'light' | 'medium' | 'heavy';

export type Mood = 'good' | 'neutral' | 'tired' | 'stressed' | 'irritable';

export interface DayLog {
  date: string; // YYYY-MM-DD
  flowLevel: FlowLevel;
  symptomsDefault: string[];
  symptomsCustom: string[];
  mood: Mood | '';
  note: string;
}

export interface CustomSymptom {
  id?: number;
  label: string;
  createdAt: string; // ISO
}

export interface CycleInfo {
  startDate: string;
  endDate: string | null;
  length: number | null;
}

export type CyclePhase = 'period' | 'follicular' | 'ovulation' | 'luteal' | 'unknown';

export interface PhaseRange {
  phase: CyclePhase;
  startDay: number;
  endDay: number;
  label: string;
}

export interface CycleStats {
  currentDay: number | null;
  phase: CyclePhase;
  phaseLabel: string;
  nextPeriodDate: string | null;
  averageCycleLength: number;
  periodLength: number;
  cycles: CycleInfo[];
  phases: PhaseRange[];
  ovulationDay: number;
}

export type ThemeMode = 'system' | 'light' | 'dark';

export type TabId = 'dashboard' | 'calendar' | 'stats' | 'settings';
