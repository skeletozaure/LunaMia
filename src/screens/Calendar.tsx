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
import { ChevronLeft, ChevronRight, StickyNote, ChevronDown } from 'lucide-react';
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
  const [legendOpen, setLegendOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
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

  const phaseMap = useMemo(() => {
    const map = new Map<string, CyclePhase>();
    if (stats.cycles.length === 0 || stats.phases.length === 0) return map;
    const all = stats.cycles;
    for (const day of days) {
      const dateStr = format(day, 'yyyy-MM-dd');
      let bestStart: string | null = null;
      for (const c of all) {
        if (c.startDate <= dateStr) bestStart = c.startDate;
      }
      if (!bestStart) continue;
      const cycleDay = differenceInDays(parseISO(dateStr), parseISO(bestStart)) + 1;
      if (cycleDay >= 1 && cycleDay <= stats.averageCycleLength) {
        const actualPL = actualPeriodLengths.get(bestStart);
        const cyclePhases = actualPL !== undefined
          ? buildPhaseRanges(stats.averageCycleLength, actualPL)
          : stats.phases;
        map.set(dateStr, getCyclePhase(cycleDay, cyclePhases));
      }
    }
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

  function handleDayClick(dateStr: string) {
    setSelectedDate(dateStr);
    onSelectDate(dateStr);
  }

  return (
    <div className="p-4 space-y-3">
      {/* Navigation mois */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-xl hover:bg-surface-alt text-foreground transition-all"
          aria-label="Mois précédent"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-foreground capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-xl hover:bg-surface-alt text-foreground transition-all"
          aria-label="Mois suivant"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* En-têtes jours */}
      <div className="grid grid-cols-7 text-center">
        {weekDays.map((d) => (
          <div key={d} className="text-[11px] text-muted py-1.5 font-medium uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Grille — animate on mount */}
      <div className="grid grid-cols-7 gap-px animate-fade-in-up delay-1">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const isSelected = selectedDate === dateStr;
          const log = logs.get(dateStr);
          const flow = log?.flowLevel ?? 'none';
          const fillPct = FLOW_FILL[flow];
          const hasSymptoms = log && (log.symptomsDefault.length > 0 || log.symptomsCustom.length > 0);
          const hasNote = log && log.note.length > 0;
          const moodEmoji = log?.mood ? MOOD_ICON[log.mood] : null;
          const dayPhase = phaseMap.get(dateStr);
          const phaseSuppressed = dayPhase === 'period' && log && flow === 'none';
          const phaseColor = dayPhase && !phaseSuppressed ? PHASE_COLORS[dayPhase] : null;

          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(dateStr)}
              className={`relative flex flex-col items-center justify-between overflow-hidden rounded-xl transition-all duration-200
                ${!inMonth ? 'opacity-25' : ''}
                ${today && !isSelected ? 'ring-2 ring-accent/40' : ''}
                ${isSelected ? 'ring-2 ring-accent shadow-[0_0_12px_rgba(242,125,114,0.3)] scale-[1.04]' : ''}
                ${!phaseColor && flow === 'none' ? 'hover:bg-surface-alt/60' : ''}
              `}
              style={{ minHeight: 56 }}
            >
              {/* Phase background tint — softer with reduced opacity */}
              {phaseColor && flow === 'none' && (
                <span
                  className={`absolute inset-0 pointer-events-none ${phaseColor.bg} opacity-80`}
                />
              )}

              {/* Flow fill — soft band rising from bottom */}
              {fillPct > 0 && (
                <span
                  className="absolute inset-x-0 bottom-0 bg-flow/20 dark:bg-flow/25 transition-all pointer-events-none rounded-b-xl"
                  style={{ height: `${fillPct}%` }}
                />
              )}

              {/* Day number */}
              <span
                className={`relative z-10 text-sm mt-1 leading-none transition-colors
                  ${today ? 'font-bold text-accent' : ''}
                  ${fillPct > 0 && !today ? 'text-flow font-semibold' : ''}
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

      {/* Légende — collapsible */}
      <div className="animate-fade-in-up delay-2">
        <button
          onClick={() => setLegendOpen(!legendOpen)}
          className="flex items-center gap-1 mx-auto text-[11px] text-muted hover:text-foreground transition-colors"
        >
          Légende
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${legendOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {legendOpen && (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[10px] text-muted pt-2 animate-fade-in-up">
            {stats.phases.map((p) => (
              <div key={p.phase} className="flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: PHASE_COLORS[p.phase]?.ring }}
                />
                {p.label}
              </div>
            ))}
            <div className="flex items-center gap-1">
              <span className="w-3 h-2.5 rounded-sm bg-flow/20 border border-flow/30" />
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
        )}
      </div>
    </div>
  );
}
