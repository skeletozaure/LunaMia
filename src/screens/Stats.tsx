import { useMemo } from 'react';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  BarChart3,
  TrendingUp,
  Droplets,
  ArrowRight,
  Calendar,
  Egg,
  Moon,
  Activity,
} from 'lucide-react';
import { useCycleStats } from '../hooks/useCycleStats';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { PHASE_COLORS, MOOD_OPTIONS } from '../utils/constants';

export default function Stats() {
  const stats = useCycleStats();
  const allLogs = useLiveQuery(() => db.dailyLogs.toArray()) ?? [];

  const completeCycles = stats.cycles.filter((c) => c.length !== null);
  const lengths = completeCycles.map((c) => c.length!);
  const minLength = lengths.length > 0 ? Math.min(...lengths) : null;
  const maxLength = lengths.length > 0 ? Math.max(...lengths) : null;

  // Symptom frequency
  const symptomFreq = useMemo(() => {
    const freq = new Map<string, number>();
    for (const log of allLogs) {
      for (const s of log.symptomsDefault) {
        freq.set(s, (freq.get(s) || 0) + 1);
      }
      for (const s of log.symptomsCustom) {
        freq.set(s, (freq.get(s) || 0) + 1);
      }
    }
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [allLogs]);

  // Mood distribution
  const moodDist = useMemo(() => {
    const dist = new Map<string, number>();
    for (const log of allLogs) {
      if (log.mood) {
        dist.set(log.mood, (dist.get(log.mood) || 0) + 1);
      }
    }
    return dist;
  }, [allLogs]);
  const totalMoods = [...moodDist.values()].reduce((a, b) => a + b, 0);

  // Flow days total
  const flowDays = allLogs.filter((l) => l.flowLevel !== 'none').length;
  const loggedDays = allLogs.length;

  // Period length stats (actual flow days per cycle)
  const actualPeriodLengths = useMemo(() => {
    const result: number[] = [];
    for (const cycle of stats.cycles) {
      let count = 0;
      for (const log of allLogs) {
        if (
          log.date >= cycle.startDate &&
          (!cycle.endDate || log.date <= cycle.endDate) &&
          log.flowLevel !== 'none'
        ) {
          count++;
        }
      }
      if (count > 0) result.push(count);
    }
    return result;
  }, [stats.cycles, allLogs]);

  const avgPeriodLength =
    actualPeriodLengths.length > 0
      ? Math.round(
          actualPeriodLengths.reduce((a, b) => a + b, 0) /
            actualPeriodLengths.length,
        )
      : stats.periodLength;

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <BarChart3 size={20} className="text-accent" />
        Statistiques
      </h1>

      {/* === Overview cards === */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Calendar size={16} className="text-secondary" />}
          label="Jours enregistrés"
          value={String(loggedDays)}
        />
        <StatCard
          icon={<Droplets size={16} className="text-accent" />}
          label="Jours de flux"
          value={String(flowDays)}
        />
        <StatCard
          icon={<TrendingUp size={16} className="text-green-500" />}
          label="Cycles détectés"
          value={String(stats.cycles.length)}
        />
        <StatCard
          icon={<Activity size={16} className="text-amber-500" />}
          label="Durée moy. règles"
          value={`${avgPeriodLength}j`}
        />
      </div>

      {/* === Cycle length analysis === */}
      {completeCycles.length > 0 && (
        <section className="bg-surface rounded-xl p-4 shadow-sm border border-border space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp size={16} className="text-secondary" />
            Durée de vos cycles
          </h2>

          <div className="flex items-center justify-between text-xs text-muted">
            <span>
              Min :{' '}
              <span className="font-semibold text-foreground">{minLength}j</span>
            </span>
            <span>
              Moy :{' '}
              <span className="font-semibold text-foreground">
                {stats.averageCycleLength}j
              </span>
            </span>
            <span>
              Max :{' '}
              <span className="font-semibold text-foreground">{maxLength}j</span>
            </span>
          </div>

          {/* Visual bar for each cycle */}
          <div className="space-y-1.5">
            {completeCycles.slice(-8).map((cycle) => {
              const pct = ((cycle.length! / (maxLength! + 4)) * 100).toFixed(0);
              return (
                <div key={cycle.startDate} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted w-16 shrink-0 text-right">
                    {format(parseISO(cycle.startDate), 'MMM yy', {
                      locale: fr,
                    })}
                  </span>
                  <div className="flex-1 bg-surface-alt rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-secondary/60 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-foreground font-medium w-6 text-right">
                    {cycle.length}j
                  </span>
                </div>
              );
            })}
          </div>

          {maxLength! - minLength! <= 3 && completeCycles.length >= 3 && (
            <p className="text-[10px] text-green-600 dark:text-green-400 text-center mt-1">
              ✓ Vos cycles sont très réguliers
            </p>
          )}
        </section>
      )}

      {/* === Current cycle phases === */}
      {stats.currentDay !== null && (
        <section className="bg-surface rounded-xl p-4 shadow-sm border border-border space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Moon size={16} className="text-amber-500" />
            Phases du cycle en cours
          </h2>

          {stats.phases.map((p) => {
            const isActive = stats.phase === p.phase;
            const color = PHASE_COLORS[p.phase];
            const daysRange = p.endDay - p.startDay + 1;
            const pct = ((daysRange / stats.averageCycleLength) * 100).toFixed(0);
            const lastStart = stats.cycles.length > 0 ? stats.cycles[stats.cycles.length - 1].startDate : null;
            const phaseStartDate = lastStart ? format(addDays(parseISO(lastStart), p.startDay - 1), 'd MMM', { locale: fr }) : `J${p.startDay}`;
            const phaseEndDate = lastStart ? format(addDays(parseISO(lastStart), p.endDay - 1), 'd MMM', { locale: fr }) : `J${p.endDay}`;

            return (
              <div
                key={p.phase}
                className={`flex items-center gap-3 rounded-lg p-2.5 transition-colors ${
                  isActive ? color?.bg ?? '' : ''
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: color?.ring }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs ${
                        isActive ? 'font-semibold text-foreground' : 'text-muted'
                      }`}
                    >
                      {p.label}
                    </span>
                    <span className="text-[10px] text-muted">
                      {phaseStartDate}–{phaseEndDate} ({daysRange}j · {pct}%)
                    </span>
                  </div>
                  {isActive && stats.currentDay !== null && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <ArrowRight size={10} className="text-foreground" />
                      <span className="text-[10px] text-foreground font-medium">
                        Vous êtes ici — {lastStart ? format(new Date(), 'd MMMM', { locale: fr }) : `Jour ${stats.currentDay}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* === Upcoming events === */}
      {stats.currentDay !== null && (
        <section className="bg-surface rounded-xl p-4 shadow-sm border border-border space-y-2.5">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Calendar size={16} className="text-accent" />
            Prochains événements
          </h2>

          <EventRow
            stats={stats}
            type="ovulation"
          />
          <EventRow
            stats={stats}
            type="period"
          />
        </section>
      )}

      {/* === Symptom frequency === */}
      {symptomFreq.length > 0 && (
        <section className="bg-surface rounded-xl p-4 shadow-sm border border-border space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity size={16} className="text-accent" />
            Symptômes fréquents
          </h2>

          <div className="space-y-1.5">
            {symptomFreq.map(([name, count]) => {
              const maxCount = symptomFreq[0][1];
              const pct = ((count / maxCount) * 100).toFixed(0);
              return (
                <div key={name} className="flex items-center gap-2">
                  <span className="text-xs text-muted w-28 shrink-0 truncate">
                    {name}
                  </span>
                  <div className="flex-1 bg-surface-alt rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent/50 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-foreground font-medium w-6 text-right">
                    {count}×
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* === Mood distribution === */}
      {totalMoods > 0 && (
        <section className="bg-surface rounded-xl p-4 shadow-sm border border-border space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            😊 Humeurs
          </h2>

          <div className="flex items-end justify-around gap-1 h-24">
            {MOOD_OPTIONS.map((m) => {
              const count = moodDist.get(m.value) || 0;
              const pct = totalMoods > 0 ? (count / totalMoods) * 100 : 0;
              return (
                <div
                  key={m.value}
                  className="flex flex-col items-center gap-1 flex-1"
                >
                  <span className="text-[10px] text-muted font-medium">
                    {pct > 0 ? `${Math.round(pct)}%` : ''}
                  </span>
                  <div className="w-full flex justify-center">
                    <div
                      className="w-5 rounded-t bg-secondary/50 transition-all"
                      style={{ height: `${Math.max(pct * 0.6, 2)}px` }}
                    />
                  </div>
                  <span className="text-sm">{m.icon}</span>
                  <span className="text-[9px] text-muted">{m.label}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {loggedDays === 0 && (
        <div className="bg-surface rounded-xl p-6 shadow-sm border border-border text-center space-y-2">
          <BarChart3 size={32} className="mx-auto text-muted" />
          <p className="text-sm text-foreground font-medium">
            Pas encore de données
          </p>
          <p className="text-xs text-muted">
            Enregistrez vos premières journées pour voir apparaître vos statistiques.
          </p>
        </div>
      )}

      <p className="text-[10px] text-muted/60 text-center pb-2">
        Ces statistiques sont basées uniquement sur vos données locales.
      </p>
    </div>
  );
}

// === Sub-components ===

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface rounded-xl p-3 shadow-sm border border-border">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] text-muted">{label}</span>
      </div>
      <p className="text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function EventRow({ stats, type }: { stats: import('../types').CycleStats; type: 'period' | 'ovulation' }) {
  if (stats.currentDay === null) return null;

  const today = new Date();

  if (type === 'ovulation') {
    const daysUntil = stats.ovulationDay - stats.currentDay;
    if (daysUntil < -1) return null; // already passed

    const icon = <Egg size={16} className="text-green-500" />;
    let label: string;
    let sub: string;

    const lastStart = stats.cycles.length > 0 ? stats.cycles[stats.cycles.length - 1].startDate : null;
    const ovulationDate = lastStart ? format(addDays(parseISO(lastStart), stats.ovulationDay - 1), 'd MMMM', { locale: fr }) : null;

    if (daysUntil <= -1 || daysUntil === 0) {
      label = 'Ovulation estimée aujourd\'hui';
      sub = ovulationDate ? `Estimée le ${ovulationDate}` : `Jour ${stats.ovulationDay} du cycle`;
    } else {
      label = daysUntil === 1 ? 'Ovulation demain' : `Ovulation dans ${daysUntil} jours`;
      sub = ovulationDate ? `Estimée le ${ovulationDate}` : `Estimée vers le jour ${stats.ovulationDay}`;
    }

    return (
      <div className="flex items-center gap-3 py-1.5">
        {icon}
        <div>
          <p className="text-xs font-medium text-foreground">{label}</p>
          <p className="text-[10px] text-muted">{sub}</p>
        </div>
      </div>
    );
  }

  // Period
  if (!stats.nextPeriodDate) return null;
  const daysUntil = differenceInDays(parseISO(stats.nextPeriodDate), today);

  const icon = <Droplets size={16} className="text-accent" />;
  let label: string;
  let sub: string;

  if (daysUntil <= 0) {
    if (stats.phase === 'period') return null; // already showing in insights
    label = 'Règles attendues';
    sub = daysUntil === 0 ? 'Prévues aujourd\'hui' : `En retard de ${Math.abs(daysUntil)} jour${Math.abs(daysUntil) > 1 ? 's' : ''}`;
  } else {
    label =
      daysUntil === 1
        ? 'Règles demain'
        : `Règles dans ${daysUntil} jours`;
    sub = `Estimées le ${format(parseISO(stats.nextPeriodDate), 'd MMMM', { locale: fr })}`;
  }

  return (
    <div className="flex items-center gap-3 py-1.5">
      {icon}
      <div>
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="text-[10px] text-muted">{sub}</p>
      </div>
    </div>
  );
}
