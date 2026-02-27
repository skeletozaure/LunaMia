import { useMemo } from 'react';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  TrendingUp,
  Droplets,
  ArrowRight,
  Calendar,
  Egg,
  Moon,
  Activity,
  Sparkles,
  CalendarPlus,
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

  const symptomFreq = useMemo(() => {
    const freq = new Map<string, number>();
    for (const log of allLogs) {
      for (const s of log.symptomsDefault) freq.set(s, (freq.get(s) || 0) + 1);
      for (const s of log.symptomsCustom) freq.set(s, (freq.get(s) || 0) + 1);
    }
    return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [allLogs]);

  const moodDist = useMemo(() => {
    const dist = new Map<string, number>();
    for (const log of allLogs) {
      if (log.mood) dist.set(log.mood, (dist.get(log.mood) || 0) + 1);
    }
    return dist;
  }, [allLogs]);
  const totalMoods = [...moodDist.values()].reduce((a, b) => a + b, 0);

  const flowDays = allLogs.filter((l) => l.flowLevel !== 'none').length;
  const loggedDays = allLogs.length;

  const actualPeriodLengths = useMemo(() => {
    const result: number[] = [];
    for (const cycle of stats.cycles) {
      let count = 0;
      for (const log of allLogs) {
        if (log.date >= cycle.startDate && (!cycle.endDate || log.date <= cycle.endDate) && log.flowLevel !== 'none') count++;
      }
      if (count > 0) result.push(count);
    }
    return result;
  }, [stats.cycles, allLogs]);

  const avgPeriodLength =
    actualPeriodLengths.length > 0
      ? Math.round(actualPeriodLengths.reduce((a, b) => a + b, 0) / actualPeriodLengths.length)
      : stats.periodLength;

  // Regularity insight
  const variation = minLength !== null && maxLength !== null ? maxLength - minLength : null;
  const isRegular = variation !== null && variation <= 3 && completeCycles.length >= 3;
  const isIrregular = variation !== null && variation >= 8 && completeCycles.length >= 3;

  // Cycle progress
  const cycleProgress = stats.currentDay !== null ? Math.min(stats.currentDay / stats.averageCycleLength, 1) : 0;

  return (
    <div className="space-y-5 p-4">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Sparkles size={22} className="text-accent" />
          Mes insights
        </h1>
        <p className="text-xs text-muted mt-0.5">Ton corps te parle — voici ce qu'on observe.</p>
      </div>

      {/* ===== Empty state ===== */}
      {loggedDays === 0 && (
        <div className="animate-fade-in-up delay-1 bg-surface rounded-2xl p-8 shadow-sm border border-border text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
            <CalendarPlus size={32} className="text-secondary" />
          </div>
          <p className="text-base font-semibold text-foreground">Pas encore de données</p>
          <p className="text-sm text-muted leading-relaxed">
            Commence par enregistrer quelques jours pour voir apparaître tes premières tendances.
          </p>
        </div>
      )}

      {/* ===== KPI cards — big numbers ===== */}
      {loggedDays > 0 && (
        <div className="grid grid-cols-2 gap-3 animate-fade-in-up delay-1">
          <KpiCard icon={<Calendar size={15} className="text-secondary" />} label="Jours enregistrés" value={String(loggedDays)} accent="border-secondary/20" />
          <KpiCard icon={<Droplets size={15} className="text-flow" />} label="Jours de flux" value={String(flowDays)} accent="border-flow/20" />
          <KpiCard icon={<TrendingUp size={15} className="text-ovulation" />} label="Cycles détectés" value={String(stats.cycles.length)} accent="border-ovulation/20" />
          <KpiCard icon={<Activity size={15} className="text-luteal" />} label="Durée moy. règles" value={`${avgPeriodLength}j`} accent="border-luteal/20" />
        </div>
      )}

      {/* ===== Insight cards — contextual messages ===== */}
      {loggedDays > 0 && (
        <div className="space-y-2 animate-fade-in-up delay-2">
          {isRegular && (
            <InsightCard
              icon={<TrendingUp size={18} className="text-ovulation" />}
              title="Cycles réguliers"
              message={`Tes ${completeCycles.length > 3 ? completeCycles.length : '3 derniers'} cycles varient de ${minLength} à ${maxLength} jours. Très régulier !`}
              bg="bg-ovulation/8"
            />
          )}
          {isIrregular && (
            <InsightCard
              icon={<TrendingUp size={18} className="text-luteal" />}
              title="Cycles irréguliers"
              message={`Tes cycles varient de ${minLength} à ${maxLength} jours (écart de ${variation} jours). C'est normal pour beaucoup de personnes.`}
              bg="bg-luteal/8"
            />
          )}
          {avgPeriodLength > 0 && completeCycles.length >= 1 && (
            <InsightCard
              icon={<Droplets size={18} className="text-flow" />}
              title={`Durée moyenne des règles : ${avgPeriodLength} jours`}
              message={`Basé sur ${actualPeriodLengths.length} cycle${actualPeriodLengths.length > 1 ? 's' : ''} enregistré${actualPeriodLengths.length > 1 ? 's' : ''}.`}
              bg="bg-flow/8"
            />
          )}
        </div>
      )}

      {/* ===== Cycle progress ring (mini) ===== */}
      {stats.currentDay !== null && (
        <section className="animate-fade-in-up delay-2 bg-surface rounded-2xl p-5 shadow-sm border border-border flex items-center gap-5">
          <MiniRing progress={cycleProgress} color={PHASE_COLORS[stats.phase]?.ring ?? '#8A8AAE'} day={stats.currentDay} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Cycle en cours</p>
            <p className="text-xs text-muted mt-0.5">
              Jour {stats.currentDay} sur ~{stats.averageCycleLength} — {stats.phases.find(p => p.phase === stats.phase)?.label ?? 'Indéterminée'}
            </p>
            {stats.nextPeriodDate && (
              <p className="text-[11px] text-muted mt-1">
                Prochaines règles : <span className="text-foreground font-medium">{format(parseISO(stats.nextPeriodDate), 'd MMMM', { locale: fr })}</span>
              </p>
            )}
          </div>
        </section>
      )}

      {/* ===== Sparkline — cycle lengths ===== */}
      {completeCycles.length >= 2 && (
        <section className="animate-fade-in-up delay-3 bg-surface rounded-2xl p-4 shadow-sm border border-border space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp size={16} className="text-secondary" />
            Évolution de tes cycles
          </h2>

          <div className="flex items-center justify-between text-[11px] text-muted">
            <span>Min : <span className="font-semibold text-foreground">{minLength}j</span></span>
            <span>Moy : <span className="font-semibold text-foreground">{stats.averageCycleLength}j</span></span>
            <span>Max : <span className="font-semibold text-foreground">{maxLength}j</span></span>
          </div>

          {/* SVG sparkline */}
          <CycleSparkline cycles={completeCycles.slice(-8)} maxLen={maxLength!} avgLen={stats.averageCycleLength} />
        </section>
      )}

      {/* ===== Current cycle phases ===== */}
      {stats.currentDay !== null && (
        <section className="animate-fade-in-up delay-3 bg-surface rounded-2xl p-4 shadow-sm border border-border space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Moon size={16} className="text-luteal" />
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
                className={`flex items-center gap-3 rounded-xl p-2.5 transition-all duration-200 ${
                  isActive ? `${color?.bg ?? ''} shadow-sm` : ''
                }`}
              >
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color?.ring }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isActive ? 'font-semibold text-foreground' : 'text-muted'}`}>{p.label}</span>
                    <span className="text-[10px] text-muted">{phaseStartDate}–{phaseEndDate} ({daysRange}j · {pct}%)</span>
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

      {/* ===== Upcoming events ===== */}
      {stats.currentDay !== null && (
        <section className="animate-fade-in-up delay-4 bg-surface rounded-2xl p-4 shadow-sm border border-border space-y-2.5">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Calendar size={16} className="text-accent" />
            Prochains événements
          </h2>
          <EventRow stats={stats} type="ovulation" />
          <EventRow stats={stats} type="period" />
        </section>
      )}

      {/* ===== Symptom frequency ===== */}
      {symptomFreq.length > 0 && (
        <section className="animate-fade-in-up delay-4 bg-surface rounded-2xl p-4 shadow-sm border border-border space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity size={16} className="text-accent" />
            Symptômes fréquents
          </h2>
          <div className="space-y-2">
            {symptomFreq.map(([name, count]) => {
              const maxCount = symptomFreq[0][1];
              const pct = ((count / maxCount) * 100).toFixed(0);
              return (
                <div key={name} className="flex items-center gap-2">
                  <span className="text-xs text-muted w-28 shrink-0 truncate">{name}</span>
                  <div className="flex-1 bg-surface-alt rounded-full h-2.5 overflow-hidden">
                    <div className="h-full rounded-full bg-accent/40 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-foreground font-medium w-6 text-right">{count}×</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== Mood distribution ===== */}
      {totalMoods > 0 && (
        <section className="animate-fade-in-up delay-5 bg-surface rounded-2xl p-4 shadow-sm border border-border space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            😊 Humeurs
          </h2>
          <div className="flex items-end justify-around gap-1 h-24">
            {MOOD_OPTIONS.map((m) => {
              const count = moodDist.get(m.value) || 0;
              const pct = totalMoods > 0 ? (count / totalMoods) * 100 : 0;
              return (
                <div key={m.value} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-[10px] text-muted font-medium">{pct > 0 ? `${Math.round(pct)}%` : ''}</span>
                  <div className="w-full flex justify-center">
                    <div className="w-5 rounded-t bg-secondary/40 transition-all" style={{ height: `${Math.max(pct * 0.6, 2)}px` }} />
                  </div>
                  <span className="text-sm">{m.icon}</span>
                  <span className="text-[9px] text-muted">{m.label}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <p className="text-[10px] text-muted/50 text-center pb-2">
        Basé uniquement sur tes données locales.
      </p>
    </div>
  );
}

// ========================= Sub-components =========================

/** KPI card — big number, small label, accent border */
function KpiCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className={`relative bg-surface rounded-xl p-3.5 shadow-sm border ${accent} overflow-hidden`}>
      <span className="absolute top-2.5 right-2.5">{icon}</span>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}

/** Contextual insight card */
function InsightCard({ icon, title, message, bg }: { icon: React.ReactNode; title: string; message: string; bg: string }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl p-3.5 ${bg}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted mt-0.5">{message}</p>
      </div>
    </div>
  );
}

/** Mini progress ring for current cycle */
function MiniRing({ progress, color, day }: { progress: number; color: string; day: number }) {
  const size = 64;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" className="text-border" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color }}>
        J{day}
      </span>
    </div>
  );
}

/** SVG sparkline for cycle lengths */
function CycleSparkline({ cycles, maxLen, avgLen }: { cycles: { startDate: string; length: number | null }[]; maxLen: number; avgLen: number }) {
  const W = 280;
  const H = 60;
  const PAD = 4;
  const n = cycles.length;
  if (n < 2) return null;

  const xStep = (W - PAD * 2) / (n - 1);
  const yScale = (H - PAD * 2) / (maxLen + 4);

  const points = cycles.map((c, i) => ({
    x: PAD + i * xStep,
    y: H - PAD - (c.length ?? avgLen) * yScale,
    len: c.length ?? avgLen,
    label: format(parseISO(c.startDate), 'MMM yy', { locale: fr }),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const avgY = H - PAD - avgLen * yScale;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16">
      {/* Average line */}
      <line x1={PAD} y1={avgY} x2={W - PAD} y2={avgY} stroke="var(--color-muted)" strokeWidth={0.7} strokeDasharray="4 3" opacity={0.5} />
      {/* Sparkline */}
      <path d={linePath} fill="none" stroke="var(--color-secondary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3.5} fill="var(--color-secondary)" />
          <text x={p.x} y={p.y - 7} textAnchor="middle" fontSize={8} fill="var(--color-foreground)" fontWeight={600}>{p.len}j</text>
        </g>
      ))}
    </svg>
  );
}

function EventRow({ stats, type }: { stats: import('../types').CycleStats; type: 'period' | 'ovulation' }) {
  if (stats.currentDay === null) return null;

  const today = new Date();

  if (type === 'ovulation') {
    const daysUntil = stats.ovulationDay - stats.currentDay;
    if (daysUntil < -1) return null;

    const icon = <Egg size={16} className="text-ovulation" />;
    const lastStart = stats.cycles.length > 0 ? stats.cycles[stats.cycles.length - 1].startDate : null;
    const ovulationDate = lastStart ? format(addDays(parseISO(lastStart), stats.ovulationDay - 1), 'd MMMM', { locale: fr }) : null;

    let label: string;
    let sub: string;
    if (daysUntil <= 0) {
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

  if (!stats.nextPeriodDate) return null;
  const daysUntil = differenceInDays(parseISO(stats.nextPeriodDate), today);

  const icon = <Droplets size={16} className="text-accent" />;
  let label: string;
  let sub: string;

  if (daysUntil <= 0) {
    if (stats.phase === 'period') return null;
    label = 'Règles attendues';
    sub = daysUntil === 0 ? 'Prévues aujourd\'hui' : `En retard de ${Math.abs(daysUntil)} jour${Math.abs(daysUntil) > 1 ? 's' : ''}`;
  } else {
    label = daysUntil === 1 ? 'Règles demain' : `Règles dans ${daysUntil} jours`;
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
