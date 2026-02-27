import { differenceInDays, addDays, format, parseISO } from 'date-fns';
import type { DayLog, CycleInfo, CyclePhase, CycleStats, PhaseRange } from '../types';
import { PHASE_LABELS } from './constants';

/**
 * Detect period start dates from sorted daily logs.
 * A period start = a day with flow > 'none' preceded by a day without flow (or no log).
 */
export function detectPeriodStarts(logs: DayLog[]): string[] {
  const sorted = [...logs]
    .filter((l) => l.flowLevel !== 'none')
    .sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length === 0) return [];

  const flowDates = new Set(sorted.map((l) => l.date));
  const starts: string[] = [];

  for (const log of sorted) {
    const prev = format(addDays(parseISO(log.date), -1), 'yyyy-MM-dd');
    if (!flowDates.has(prev)) {
      starts.push(log.date);
    }
  }

  return starts;
}

/**
 * Build cycle objects from period start dates.
 */
export function buildCycles(periodStarts: string[]): CycleInfo[] {
  const cycles: CycleInfo[] = [];

  for (let i = 0; i < periodStarts.length; i++) {
    const start = periodStarts[i];
    const nextStart = periodStarts[i + 1] ?? null;
    const endDate = nextStart ? format(addDays(parseISO(nextStart), -1), 'yyyy-MM-dd') : null;
    const length = nextStart ? differenceInDays(parseISO(nextStart), parseISO(start)) : null;

    cycles.push({ startDate: start, endDate, length });
  }

  return cycles;
}

/**
 * Compute average cycle length from the last N complete cycles.
 */
export function averageCycleLength(cycles: CycleInfo[], count: number, fallback: number): number {
  const complete = cycles.filter((c) => c.length !== null).slice(-count);
  if (complete.length === 0) return fallback;
  const sum = complete.reduce((acc, c) => acc + c.length!, 0);
  return Math.round(sum / complete.length);
}

/**
 * Build the list of phase ranges for a given cycle length.
 * Ovulation is estimated ~14 days before the end of the cycle (luteal phase ≈ 14 days).
 */
export function buildPhaseRanges(avgCycleLength: number, periodLength: number): PhaseRange[] {
  const ovulationDay = Math.max(periodLength + 1, avgCycleLength - 14);
  return [
    { phase: 'period',     startDay: 1,                endDay: periodLength,        label: PHASE_LABELS.period },
    { phase: 'follicular', startDay: periodLength + 1,  endDay: ovulationDay - 2,    label: PHASE_LABELS.follicular },
    { phase: 'ovulation',  startDay: ovulationDay - 1,  endDay: ovulationDay + 1,    label: PHASE_LABELS.ovulation },
    { phase: 'luteal',     startDay: ovulationDay + 2,  endDay: avgCycleLength,      label: PHASE_LABELS.luteal },
  ];
}

/**
 * Determine current cycle phase from the phase ranges.
 */
export function getCyclePhase(currentDay: number, phases: PhaseRange[]): CyclePhase {
  if (currentDay <= 0) return 'unknown';
  for (const p of phases) {
    if (currentDay >= p.startDay && currentDay <= p.endDay) return p.phase;
  }
  return 'unknown';
}

/**
 * Compute full cycle stats from all daily logs.
 */
export function computeCycleStats(
  allLogs: DayLog[],
  settingsCycleLength: number,
  settingsPeriodLength: number,
): CycleStats {
  const periodStarts = detectPeriodStarts(allLogs);
  const cycles = buildCycles(periodStarts);
  const avgLength = averageCycleLength(cycles, 3, settingsCycleLength);
  const phases = buildPhaseRanges(avgLength, settingsPeriodLength);
  const ovulationDay = Math.max(settingsPeriodLength + 1, avgLength - 14);

  const today = format(new Date(), 'yyyy-MM-dd');

  let currentDay: number | null = null;
  let nextPeriodDate: string | null = null;
  let phase: CyclePhase = 'unknown';

  if (periodStarts.length > 0) {
    const lastStart = periodStarts[periodStarts.length - 1];
    currentDay = differenceInDays(parseISO(today), parseISO(lastStart)) + 1;

    if (currentDay > avgLength + 14) {
      currentDay = null;
      phase = 'unknown';
    } else {
      phase = getCyclePhase(currentDay, phases);
    }

    const nextDate = addDays(parseISO(lastStart), avgLength);
    nextPeriodDate = format(nextDate, 'yyyy-MM-dd');
  }

  return {
    currentDay,
    phase,
    phaseLabel: PHASE_LABELS[phase],
    nextPeriodDate,
    averageCycleLength: avgLength,
    periodLength: settingsPeriodLength,
    cycles,
    phases,
    ovulationDay,
  };
}
