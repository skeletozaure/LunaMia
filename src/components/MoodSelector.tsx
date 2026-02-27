import type { Mood } from '../types';
import { MOOD_OPTIONS } from '../utils/constants';

interface Props {
  value: Mood | '';
  onChange: (v: Mood | '') => void;
}

export default function MoodSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">Humeur</label>
      <div className="flex gap-2 flex-wrap">
        {MOOD_OPTIONS.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(isActive ? '' : (opt.value as Mood))}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-colors
                ${isActive ? 'bg-secondary text-white' : 'bg-surface-alt text-foreground hover:bg-surface-alt/80'}`}
            >
              <span className="text-sm">{opt.icon}</span>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
