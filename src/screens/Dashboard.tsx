import { format, parseISO, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PenLine, CalendarPlus, Heart, Egg, Moon } from 'lucide-react';
import { useCycleStats } from '../hooks/useCycleStats';
import { useDayLog } from '../hooks/useDayLog';
import { MOOD_OPTIONS, FLOW_OPTIONS, PHASE_COLORS } from '../utils/constants';
import CycleRing from '../components/CycleRing';
import Insights from '../components/Insights';

interface Props {
  onOpenToday: () => void;
}

export default function Dashboard({ onOpenToday }: Props) {
  const stats = useCycleStats();
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: todayLog } = useDayLog(today);

  const hasData = stats.currentDay !== null;
  const flowLabel = FLOW_OPTIONS.find((f) => f.value === todayLog.flowLevel)?.label;
  const moodLabel = MOOD_OPTIONS.find((m) => m.value === todayLog.mood)?.label;
  const moodIcon = MOOD_OPTIONS.find((m) => m.value === todayLog.mood)?.icon;

  const kpiIcons = [
    <Heart size={14} className="text-accent" />,
    <Egg size={14} className="text-ovulation" />,
    <Moon size={14} className="text-secondary" />,
  ];

  return (
    <div className="space-y-5 p-4">
      {/* ===== Hero block ===== */}
      <div className="animate-fade-in-up rounded-2xl bg-gradient-to-br from-accent/10 via-surface to-surface p-5 text-center space-y-1">
        <h1 className="text-2xl font-bold text-accent tracking-tight">LunaMia</h1>
        <p className="text-sm text-muted capitalize">
          {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
        </p>
        <p className="text-xs text-muted/70 pt-0.5">Prête à suivre ton cycle en douceur ?</p>
      </div>

      {/* ===== Cycle ring ===== */}
      {hasData ? (
        <div className="animate-fade-in-up delay-1 bg-surface rounded-2xl p-5 shadow-sm border border-border flex flex-col items-center space-y-4">
          <CycleRing
            currentDay={stats.currentDay}
            totalDays={stats.averageCycleLength}
            phases={stats.phases}
            phase={stats.phase}
          />

          {/* Prochaines règles */}
          {stats.nextPeriodDate && (
            <p className="text-xs text-muted text-center">
              Prochaines règles estimées :{' '}
              <span className="font-medium text-foreground">
                {format(parseISO(stats.nextPeriodDate), 'd MMMM', { locale: fr })}
              </span>
            </p>
          )}

          {/* Légende des phases */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
            {stats.phases.map((p) => {
              const lastStart = stats.cycles.length > 0 ? stats.cycles[stats.cycles.length - 1].startDate : null;
              const startDate = lastStart ? format(addDays(parseISO(lastStart), p.startDay - 1), 'd MMM', { locale: fr }) : `J${p.startDay}`;
              const endDate = lastStart ? format(addDays(parseISO(lastStart), p.endDay - 1), 'd MMM', { locale: fr }) : `J${p.endDay}`;
              return (
                <div key={p.phase} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PHASE_COLORS[p.phase]?.ring }}
                  />
                  <span className={`text-[11px] ${stats.phase === p.phase ? 'font-semibold text-foreground' : 'text-muted'}`}>
                    {p.label}
                    <span className="text-muted font-normal"> {startDate}–{endDate}</span>
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-muted/60 text-center">
            Prévision indicative basée sur vos données enregistrées.
          </p>
        </div>
      ) : (
        /* ===== Empty state — warm & inviting ===== */
        <div className="animate-fade-in-up delay-1 bg-surface rounded-2xl p-8 shadow-sm border border-border text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
            <CalendarPlus size={32} className="text-accent" />
          </div>
          <p className="text-base font-semibold text-foreground">
            Bienvenue sur LunaMia
          </p>
          <p className="text-sm text-muted leading-relaxed">
            Commence par enregistrer ton premier jour de règles pour construire tes premières estimations.
          </p>
          <button
            onClick={onOpenToday}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:bg-accent/90 transition-all"
          >
            <CalendarPlus size={16} />
            Commencer
          </button>
        </div>
      )}

      {/* Alertes et informations contextuelles */}
      {hasData && <Insights stats={stats} />}

      {/* ===== KPI cards — personality ===== */}
      <div className="grid grid-cols-3 gap-3 animate-fade-in-up delay-2">
        {[
          {
            label: 'Cycle moyen',
            value: stats.averageCycleLength,
            unit: 'j',
            icon: kpiIcons[0],
            color: 'border-accent/20',
          },
          {
            label: 'Ovulation',
            value: stats.cycles.length > 0
              ? `~${format(addDays(parseISO(stats.cycles[stats.cycles.length - 1].startDate), stats.ovulationDay - 1), 'd MMM', { locale: fr })}`
              : `~J${stats.ovulationDay}`,
            unit: '',
            icon: kpiIcons[1],
            color: 'border-ovulation/20',
          },
          {
            label: 'Cycles',
            value: stats.cycles.length,
            unit: '',
            icon: kpiIcons[2],
            color: 'border-secondary/20',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`relative bg-surface rounded-xl p-3.5 shadow-sm border ${kpi.color} text-center overflow-hidden`}
          >
            {/* Colored accent dot */}
            <span className="absolute top-2 right-2">{kpi.icon}</span>
            <p className="text-2xl font-bold text-foreground mt-1">
              {kpi.value}<span className="text-xs font-normal text-muted">{kpi.unit}</span>
            </p>
            <p className="text-[10px] text-muted uppercase tracking-wider mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* ===== Résumé du jour ===== */}
      <div className="animate-fade-in-up delay-3 bg-surface rounded-xl p-4 shadow-sm border border-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Aujourd'hui</span>
          <button
            onClick={onOpenToday}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-accent rounded-lg shadow-sm shadow-accent/20 hover:bg-accent/90 transition-all"
          >
            <PenLine size={13} />
            Ajouter aujourd'hui
          </button>
        </div>
        {todayLog.flowLevel !== 'none' || todayLog.mood || todayLog.symptomsDefault.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-xs text-muted">
            {todayLog.flowLevel !== 'none' && (
              <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium">
                Flux {flowLabel?.toLowerCase()}
              </span>
            )}
            {todayLog.mood && (
              <span className="px-2.5 py-1 rounded-full bg-secondary/10 text-secondary font-medium">
                {moodIcon} {moodLabel}
              </span>
            )}
            {todayLog.symptomsDefault.length > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-surface-alt text-foreground">
                {todayLog.symptomsDefault.length} symptôme{todayLog.symptomsDefault.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted">Aucune saisie pour aujourd'hui.</p>
        )}
      </div>
    </div>
  );
}
