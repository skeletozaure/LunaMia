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
  period:      { ring: '#A35F73', bg: 'bg-flow/12',       text: 'text-flow' },
  follicular:  { ring: '#7EA7FF', bg: 'bg-secondary/10',  text: 'text-secondary' },
  ovulation:   { ring: '#7BCF9A', bg: 'bg-ovulation/12',  text: 'text-ovulation' },
  luteal:      { ring: '#D6A35D', bg: 'bg-luteal/12',     text: 'text-luteal' },
  unknown:     { ring: '#8A8AAE', bg: 'bg-surface-alt',   text: 'text-muted' },
};

export const APP_VERSION = '1.0.0';
