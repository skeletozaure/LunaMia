import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addDays,
  isSameMonth,
  isToday,
  differenceInDays,
  parseISO,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, StickyNote } from 'lucide-react';
import { useDayLogs } from '../hooks/useDayLog';
import { useCycleStats } from '../hooks/useCycleStats';
import { MOOD_OPTIONS, PHASE_COLORS } from '../utils/constants';
import { getCyclePhase, buildPhaseRanges } from '../utils/cycleCalculations';
import type { FlowLevel, CyclePhase } from '../types';

interface Props {
  onSelectDate: (date: string) => void;
}

/** Percentage fill height per flow level */
const FLOW_FILL: Record<FlowLevel, number> = {
  none: 0,
  light: 30,
  medium: 60,
  heavy: 100,
};

/** Mood value → emoji lookup */
const MOOD_ICON = Object.fromEntries(MOOD_OPTIONS.map((m) => [m.value, m.icon]));

export default function Calendar({ onSelectDate }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const stats = useCycleStats();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const rangeStart = format(calStart, 'yyyy-MM-dd');
  const rangeEnd = format(calEnd, 'yyyy-MM-dd');
  const { logs } = useDayLogs(rangeStart, rangeEnd);

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Compute actual period length per cycle from logged flow data.
  // This overrides the default periodLength from settings so the calendar
  // doesn't show predicted "period" color on days where flow actually stopped.
  const actualPeriodLengths = useMemo(() => {
    const map = new Map<string, number>();
    for (const cycle of stats.cycles) {
      let lastFlowDay = 0;
      let ended = false;
      for (let d = 0; d < stats.periodLength + 2 && !ended; d++) {
        const checkDate = format(addDays(parseISO(cycle.startDate), d), 'yyyy-MM-dd');
        const dayLog = logs.get(checkDate);
        if (dayLog) {
          if (dayLog.flowLevel !== 'none') {
            lastFlowDay = d + 1;
          } else if (d > 0) {
            // Explicit no-flow after period started → period ended
            ended = true;
          }
        }
      }
      if (lastFlowDay > 0) {
        map.set(cycle.startDate, lastFlowDay);
      }
    }
    return map;
  }, [stats.cycles, stats.periodLength, logs]);

  // Pre-compute predicted phase for every calendar day
  const phaseMap = useMemo(() => {
    const map = new Map<string, CyclePhase>();
    if (stats.cycles.length === 0 || stats.phases.length === 0) return map;
    // Use every known period start to project phase forward
    const all = stats.cycles;
    for (const day of days) {
      const dateStr = format(day, 'yyyy-MM-dd');
      // Find the relevant cycle (whose start ≤ this date)
      let bestStart: string | null = null;
      for (const c of all) {
        if (c.startDate <= dateStr) bestStart = c.startDate;
      }
      if (!bestStart) continue;
      const cycleDay = differenceInDays(parseISO(dateStr), parseISO(bestStart)) + 1;
      if (cycleDay >= 1 && cycleDay <= stats.averageCycleLength) {
        // Use actual period length for this cycle if we have real flow data
        const actualPL = actualPeriodLengths.get(bestStart);
        const cyclePhases = actualPL !== undefined
          ? buildPhaseRanges(stats.averageCycleLength, actualPL)
          : stats.phases;
        map.set(dateStr, getCyclePhase(cycleDay, cyclePhases));
      }
    }
    // Also project future from last period start (uses default phases)
    const lastStart = all[all.length - 1].startDate;
    for (let d = 1; d <= stats.averageCycleLength * 2; d++) {
      const dateStr = format(addDays(parseISO(lastStart), d - 1), 'yyyy-MM-dd');
      if (!map.has(dateStr)) {
        const cycleDay = ((d - 1) % stats.averageCycleLength) + 1;
        map.set(dateStr, getCyclePhase(cycleDay, stats.phases));
      }
    }
    return map;
  }, [stats.cycles, stats.phases, stats.averageCycleLength, actualPeriodLengths, days]);

  return (
    <div className="p-4 space-y-3">
      {/* Navigation mois */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-surface-alt text-foreground transition-colors"
          aria-label="Mois précédent"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-base font-semibold text-foreground capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-surface-alt text-foreground transition-colors"
          aria-label="Mois suivant"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* En-têtes jours */}
      <div className="grid grid-cols-7 text-center">
        {weekDays.map((d) => (
          <div key={d} className="text-xs text-muted py-1 font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Grille */}
      <div className="grid grid-cols-7 gap-px">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const log = logs.get(dateStr);
          const flow = log?.flowLevel ?? 'none';
          const fillPct = FLOW_FILL[flow];
          const hasSymptoms = log && (log.symptomsDefault.length > 0 || log.symptomsCustom.length > 0);
          const hasNote = log && log.note.length > 0;
          const moodEmoji = log?.mood ? MOOD_ICON[log.mood] : null;
          const dayPhase = phaseMap.get(dateStr);
          // Don't show predicted "period" color if user logged no flow for this day
          const phaseSuppressed = dayPhase === 'period' && log && flow === 'none';
          const phaseColor = dayPhase && !phaseSuppressed ? PHASE_COLORS[dayPhase] : null;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`relative flex flex-col items-center justify-between overflow-hidden rounded-lg transition-colors
                ${!inMonth ? 'opacity-30' : ''}
                ${today ? 'ring-2 ring-foreground' : ''}
                ${!phaseColor && flow === 'none' ? 'hover:bg-surface-alt' : ''}
              `}
              style={{ minHeight: 56 }}
            >
              {/* Phase background tint (predicted) */}
              {phaseColor && flow === 'none' && (
                <span
                  className={`absolute inset-0 pointer-events-none ${phaseColor.bg}`}
                />
              )}

              {/* Flow fill — red band rising from the bottom */}
              {fillPct > 0 && (
                <span
                  className="absolute inset-x-0 bottom-0 bg-accent/25 dark:bg-accent/30 transition-all pointer-events-none"
                  style={{ height: `${fillPct}%` }}
                />
              )}

              {/* Day number */}
              <span
                className={`relative z-10 text-sm mt-1 leading-none
                  ${today ? 'font-bold text-foreground' : ''}
                  ${fillPct > 0 && !today ? 'text-accent font-semibold' : ''}
                  ${!fillPct && phaseColor && !today ? phaseColor.text : ''}
                `}
              >
                {format(day, 'd')}
              </span>

              {/* Mood emoji */}
              {moodEmoji ? (
                <span className="relative z-10 text-[11px] leading-none">{moodEmoji}</span>
              ) : (
                <span className="h-[11px]" />
              )}

              {/* Note / symptoms indicators */}
              <div className="relative z-10 flex gap-0.5 mb-0.5 h-[6px] items-center">
                {hasSymptoms && (
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" title="Symptômes" />
                )}
                {hasNote && (
                  <StickyNote size={7} className="text-muted" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Légende */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[10px] text-muted pt-2">
        {stats.phases.map((p) => (
          <div key={p.phase} className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: PHASE_COLORS[p.phase]?.ring }}
            />
            {p.label}
          </div>
        ))}
        <div className="flex items-center gap-1">
          <span className="w-3 h-2.5 rounded-sm bg-accent/25 border border-accent/30" />
          Flux
        </div>
        <div className="flex items-center gap-1">
          <span>😊</span> Humeur
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          Symptômes
        </div>
        <div className="flex items-center gap-1">
          <StickyNote size={8} className="text-muted" />
          Note
        </div>
      </div>
    </div>
  );
}
