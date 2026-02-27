import { format, parseISO, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Droplets, PenLine } from 'lucide-react';
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

  return (
    <div className="space-y-4 p-4">
      {/* Nom app + date */}
      <h1 className="text-xl font-bold text-accent text-center tracking-tight">LunaMia</h1>
      <p className="text-sm text-muted text-center capitalize -mt-2">
        {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
      </p>

      {/* Graphique circulaire du cycle */}
      {hasData ? (
        <div className="bg-surface rounded-2xl p-5 shadow-sm border border-border flex flex-col items-center space-y-4">
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
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border text-center space-y-3">
          <Droplets size={32} className="mx-auto text-accent" />
          <p className="text-sm text-foreground font-medium">
            Bienvenue sur LunaMia
          </p>
          <p className="text-xs text-muted">
            Commencez par enregistrer votre premier jour de règles pour activer le suivi.
          </p>
        </div>
      )}

      {/* Alertes et informations contextuelles */}
      {hasData && <Insights stats={stats} />}

      {/* Infos du cycle */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface rounded-xl p-3 shadow-sm border border-border text-center">
          <p className="text-xs text-muted mb-0.5">Cycle moyen</p>
          <p className="text-lg font-semibold text-foreground">
            {stats.averageCycleLength}<span className="text-xs font-normal text-muted">j</span>
          </p>
        </div>
        <div className="bg-surface rounded-xl p-3 shadow-sm border border-border text-center">
          <p className="text-xs text-muted mb-0.5">Ovulation</p>
          <p className="text-lg font-semibold text-foreground">
            {stats.cycles.length > 0
              ? `~${format(addDays(parseISO(stats.cycles[stats.cycles.length - 1].startDate), stats.ovulationDay - 1), 'd MMM', { locale: fr })}`
              : `~J${stats.ovulationDay}`}
          </p>
        </div>
        <div className="bg-surface rounded-xl p-3 shadow-sm border border-border text-center">
          <p className="text-xs text-muted mb-0.5">Cycles</p>
          <p className="text-lg font-semibold text-foreground">{stats.cycles.length}</p>
        </div>
      </div>

      {/* Résumé du jour */}
      <div className="bg-surface rounded-xl p-4 shadow-sm border border-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Aujourd'hui</span>
          <button
            onClick={onOpenToday}
            className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
          >
            <PenLine size={14} />
            Saisir
          </button>
        </div>
        {todayLog.flowLevel !== 'none' || todayLog.mood || todayLog.symptomsDefault.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-xs text-muted">
            {todayLog.flowLevel !== 'none' && (
              <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                Flux {flowLabel?.toLowerCase()}
              </span>
            )}
            {todayLog.mood && (
              <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
                {moodIcon} {moodLabel}
              </span>
            )}
            {todayLog.symptomsDefault.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-surface-alt text-foreground">
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
