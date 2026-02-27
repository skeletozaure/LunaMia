import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useSettings } from './useSettings';
import { computeCycleStats } from '../utils/cycleCalculations';
import type { CycleStats } from '../types';

export function useCycleStats(): CycleStats & { loading: boolean } {
  const { cycleLength, periodLength } = useSettings();

  const allLogs = useLiveQuery(() => db.dailyLogs.toArray());

  if (!allLogs) {
    return {
      currentDay: null,
      phase: 'unknown',
      phaseLabel: 'Indéterminée',
      nextPeriodDate: null,
      averageCycleLength: cycleLength,
      periodLength,
      cycles: [],
      phases: [],
      ovulationDay: Math.max(periodLength + 1, cycleLength - 14),
      loading: true,
    };
  }

  return {
    ...computeCycleStats(allLogs, cycleLength, periodLength),
    loading: false,
  };
}
