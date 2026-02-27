import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { DEFAULT_SYMPTOMS } from '../utils/constants';
import type { CustomSymptom } from '../types';

interface Props {
  selectedDefault: string[];
  selectedCustom: string[];
  customSymptoms: CustomSymptom[];
  onToggleDefault: (symptom: string) => void;
  onToggleCustom: (label: string) => void;
  onAddCustom: (label: string) => void;
}

export default function SymptomChips({
  selectedDefault,
  selectedCustom,
  customSymptoms,
  onToggleDefault,
  onToggleCustom,
  onAddCustom,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  function handleAdd() {
    const trimmed = newLabel.trim();
    if (trimmed) {
      onAddCustom(trimmed);
      // Also select it immediately
      onToggleCustom(trimmed);
    }
    setNewLabel('');
    setAdding(false);
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">Symptômes</label>
      <div className="flex flex-wrap gap-2">
        {DEFAULT_SYMPTOMS.map((s) => {
          const active = selectedDefault.includes(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => onToggleDefault(s)}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors
                ${active ? 'bg-accent text-white' : 'bg-surface-alt text-foreground hover:bg-surface-alt/80'}`}
            >
              {s}
            </button>
          );
        })}
        {customSymptoms.map((cs) => {
          const active = selectedCustom.includes(cs.label);
          return (
            <button
              key={cs.id}
              type="button"
              onClick={() => onToggleCustom(cs.label)}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors
                ${active ? 'bg-secondary text-white' : 'bg-surface-alt text-foreground hover:bg-surface-alt/80'}`}
            >
              {cs.label}
            </button>
          );
        })}
        {adding ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Nouveau…"
              maxLength={40}
              className="px-2 py-1 text-xs rounded-full border border-border bg-surface text-foreground w-28 focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <button type="button" onClick={handleAdd} className="text-accent">
              <Plus size={16} />
            </button>
            <button type="button" onClick={() => { setAdding(false); setNewLabel(''); }} className="text-muted">
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="px-3 py-1.5 text-xs rounded-full border border-dashed border-muted text-muted hover:text-foreground hover:border-foreground transition-colors"
          >
            + Ajouter
          </button>
        )}
      </div>
    </div>
  );
}
