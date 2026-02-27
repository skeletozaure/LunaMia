import { useMemo } from 'react';
import { differenceInDays, parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Droplets,
  Egg,
  Moon,
  Heart,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import type { CycleStats } from '../types';

interface Props {
  stats: CycleStats;
}

interface Insight {
  key: string;
  icon: React.ReactNode;
  title: string;
  message: string;
  color: string; // Tailwind bg class
}

export default function Insights({ stats }: Props) {
  const insights = useMemo(() => buildInsights(stats), [stats]);

  if (insights.length === 0) return null;

  return (
    <div className="space-y-2">
      {insights.map((ins) => (
        <div
          key={ins.key}
          className={`flex items-start gap-3 rounded-xl p-3.5 ${ins.color}`}
        >
          <span className="mt-0.5 shrink-0">{ins.icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{ins.title}</p>
            <p className="text-xs text-muted mt-0.5">{ins.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function buildInsights(stats: CycleStats): Insight[] {
  const items: Insight[] = [];
  const today = new Date();

  if (stats.currentDay === null || !stats.nextPeriodDate) return items;

  const daysUntilPeriod = differenceInDays(
    parseISO(stats.nextPeriodDate),
    today,
  );

  const ovulationDay = stats.ovulationDay;
  const daysUntilOvulation = ovulationDay - stats.currentDay;

  // === Period alerts ===
  if (stats.phase === 'period') {
    items.push({
      key: 'period-now',
      icon: <Droplets size={18} className="text-accent" />,
      title: 'Vous êtes en période de règles',
      message: `Jour ${stats.currentDay} de vos règles. Prenez soin de vous.`,
      color: 'bg-accent/8',
    });
  } else if (daysUntilPeriod >= 0 && daysUntilPeriod <= 3) {
    items.push({
      key: 'period-soon',
      icon: <Droplets size={18} className="text-accent" />,
      title:
        daysUntilPeriod === 0
          ? 'Vos règles sont prévues aujourd\'hui'
          : daysUntilPeriod === 1
            ? 'Vos règles arrivent demain'
            : `Vos règles arrivent dans ${daysUntilPeriod} jours`,
      message: `Prochaines règles estimées le ${format(parseISO(stats.nextPeriodDate), 'd MMMM', { locale: fr })}.`,
      color: 'bg-accent/8',
    });
  } else if (daysUntilPeriod < 0 && daysUntilPeriod >= -7) {
    items.push({
      key: 'period-late',
      icon: <AlertCircle size={18} className="text-amber-500" />,
      title: `Vos règles ont ${Math.abs(daysUntilPeriod)} jour${Math.abs(daysUntilPeriod) > 1 ? 's' : ''} de retard`,
      message:
        'Ceci est une estimation. Les cycles peuvent varier naturellement.',
      color: 'bg-amber-500/8',
    });
  }

  // === Ovulation alerts ===
  if (stats.phase === 'ovulation') {
    items.push({
      key: 'ovulation-now',
      icon: <Egg size={18} className="text-green-500" />,
      title: 'Période d\'ovulation estimée',
      message: 'Vous êtes dans votre fenêtre de fertilité estimée.',
      color: 'bg-green-500/8',
    });
  } else if (daysUntilOvulation > 0 && daysUntilOvulation <= 3) {
    items.push({
      key: 'ovulation-soon',
      icon: <Egg size={18} className="text-green-500" />,
      title:
        daysUntilOvulation === 1
          ? 'Ovulation estimée demain'
          : `Ovulation estimée dans ${daysUntilOvulation} jours`,
      message: `L'ovulation est estimée vers le jour ${ovulationDay} de votre cycle.`,
      color: 'bg-green-500/8',
    });
  }

  // === Luteal phase info ===
  if (stats.phase === 'luteal' && daysUntilPeriod > 3 && daysUntilPeriod <= 10) {
    items.push({
      key: 'luteal-info',
      icon: <Moon size={18} className="text-amber-500" />,
      title: 'Phase lutéale',
      message:
        'Votre corps se prépare pour le prochain cycle. Symptômes prémenstruels possibles.',
      color: 'bg-amber-500/8',
    });
  }

  // === Follicular phase info ===
  if (stats.phase === 'follicular') {
    items.push({
      key: 'follicular-info',
      icon: <Heart size={18} className="text-secondary" />,
      title: 'Phase folliculaire',
      message:
        'Votre corps se prépare à l\'ovulation. L\'énergie remonte généralement.',
      color: 'bg-secondary/8',
    });
  }

  // === Cycle regularity hint (if enough data) ===
  const completeCycles = stats.cycles.filter((c) => c.length !== null);
  if (completeCycles.length >= 3) {
    const lengths = completeCycles.slice(-6).map((c) => c.length!);
    const min = Math.min(...lengths);
    const max = Math.max(...lengths);
    const variation = max - min;
    if (variation <= 3) {
      items.push({
        key: 'regularity',
        icon: <TrendingUp size={18} className="text-green-600" />,
        title: 'Cycles réguliers',
        message: `Vos derniers cycles varient de ${min} à ${max} jours. Très régulier !`,
        color: 'bg-green-500/8',
      });
    } else if (variation >= 8) {
      items.push({
        key: 'irregularity',
        icon: <TrendingUp size={18} className="text-amber-500" />,
        title: 'Cycles irréguliers',
        message: `Vos derniers cycles varient de ${min} à ${max} jours (écart de ${variation} jours).`,
        color: 'bg-amber-500/8',
      });
    }
  }

  return items;
}
