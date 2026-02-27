import type { FlowLevel } from '../types';
import { FLOW_OPTIONS } from '../utils/constants';

interface Props {
  value: FlowLevel;
  onChange: (v: FlowLevel) => void;
}

const sizeMap: Record<string, string> = {
  none: 'w-4 h-4',
  light: 'w-5 h-5',
  medium: 'w-6 h-6',
  heavy: 'w-7 h-7',
};

export default function FlowSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">Flux</label>
      <div className="flex gap-3 items-end">
        {FLOW_OPTIONS.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value as FlowLevel)}
              className={`flex flex-col items-center gap-1 px-2.5 py-2 rounded-lg transition-colors
                ${isActive ? 'bg-accent/10 ring-1 ring-accent' : 'bg-surface-alt hover:bg-surface-alt/80'}`}
            >
              <span
                className={`${sizeMap[opt.value]} rounded-full transition-colors
                  ${opt.value === 'none'
                    ? isActive ? 'border-2 border-accent' : 'border-2 border-muted'
                    : isActive ? 'bg-accent' : 'bg-muted/40'
                  }`}
              />
              <span className={`text-xs ${isActive ? 'text-accent font-medium' : 'text-muted'}`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
