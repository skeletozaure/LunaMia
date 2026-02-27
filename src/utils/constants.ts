export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;

export const FLOW_OPTIONS: { value: string; label: string }[] = [
  { value: 'none', label: 'Aucun' },
  { value: 'light', label: 'Léger' },
  { value: 'medium', label: 'Moyen' },
  { value: 'heavy', label: 'Abondant' },
];

export const DEFAULT_SYMPTOMS = [
  'Douleurs abdominales',
  'Maux de tête',
  'Fatigue',
  'Seins sensibles',
  'Irritabilité',
  'Ballonnements',
];

export const MOOD_OPTIONS: { value: string; label: string; icon: string }[] = [
  { value: 'good', label: 'Bonne', icon: '😊' },
  { value: 'neutral', label: 'Neutre', icon: '😐' },
  { value: 'tired', label: 'Fatiguée', icon: '😴' },
  { value: 'stressed', label: 'Stressée', icon: '😰' },
  { value: 'irritable', label: 'Irritable', icon: '😤' },
];

export const PHASE_LABELS: Record<string, string> = {
  period: 'Règles',
  follicular: 'Phase folliculaire',
  ovulation: 'Ovulation',
  luteal: 'Phase lutéale',
  unknown: 'Indéterminée',
};

export const PHASE_COLORS: Record<string, { ring: string; bg: string; text: string }> = {
  period:      { ring: '#B25050', bg: 'bg-accent/15',    text: 'text-accent' },
  follicular:  { ring: '#5B8DBE', bg: 'bg-secondary/10', text: 'text-secondary' },
  ovulation:   { ring: '#7CB87C', bg: 'bg-green-500/12', text: 'text-green-600 dark:text-green-400' },
  luteal:      { ring: '#C4A35A', bg: 'bg-amber-500/12', text: 'text-amber-600 dark:text-amber-400' },
  unknown:     { ring: '#9E9E9E', bg: 'bg-surface-alt',  text: 'text-muted' },
};

export const APP_VERSION = '1.0.0';
