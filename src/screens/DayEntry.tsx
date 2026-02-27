import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X, Check } from 'lucide-react';
import { useDayLog } from '../hooks/useDayLog';
import { useCustomSymptoms } from '../hooks/useCustomSymptoms';
import FlowSelector from '../components/FlowSelector';
import SymptomChips from '../components/SymptomChips';
import MoodSelector from '../components/MoodSelector';
import type { FlowLevel, Mood } from '../types';

interface Props {
  date: string;
  onClose: () => void;
}

export default function DayEntry({ date, onClose }: Props) {
  const { data, save } = useDayLog(date);
  const { symptoms: customSymptoms, add: addCustomSymptom } = useCustomSymptoms();

  const [flowLevel, setFlowLevel] = useState<FlowLevel>(data.flowLevel);
  const [symptomsDefault, setSymptomsDefault] = useState<string[]>(data.symptomsDefault);
  const [symptomsCustom, setSymptomsCustom] = useState<string[]>(data.symptomsCustom);
  const [mood, setMood] = useState<Mood | ''>(data.mood);
  const [note, setNote] = useState(data.note);
  const [saved, setSaved] = useState(false);

  // Sync state when data loads
  useEffect(() => {
    setFlowLevel(data.flowLevel);
    setSymptomsDefault(data.symptomsDefault);
    setSymptomsCustom(data.symptomsCustom);
    setMood(data.mood);
    setNote(data.note);
  }, [data.date, data.flowLevel, data.mood, data.note, data.symptomsDefault.length, data.symptomsCustom.length]);

  function toggleDefault(s: string) {
    setSymptomsDefault((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  function toggleCustom(label: string) {
    setSymptomsCustom((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label],
    );
  }

  async function handleSave() {
    await save({ flowLevel, symptomsDefault, symptomsCustom, mood, note });
    setSaved(true);
    setTimeout(() => onClose(), 600);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-background rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between z-10">
          <h2 className="text-base font-semibold text-foreground capitalize">
            {format(parseISO(date), 'EEEE d MMMM yyyy', { locale: fr })}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-alt text-muted transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-5">
          <FlowSelector value={flowLevel} onChange={setFlowLevel} />

          <SymptomChips
            selectedDefault={symptomsDefault}
            selectedCustom={symptomsCustom}
            customSymptoms={customSymptoms}
            onToggleDefault={toggleDefault}
            onToggleCustom={toggleCustom}
            onAddCustom={addCustomSymptom}
          />

          <MoodSelector value={mood} onChange={setMood} />

          {/* Note */}
          <div className="space-y-1.5">
            <label htmlFor="note" className="text-sm font-medium text-foreground">
              Note
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={280}
              rows={3}
              placeholder="Une note pour cette journée…"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            />
            <p className="text-right text-[10px] text-muted">{note.length}/280</p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border px-4 py-3">
          <button
            onClick={handleSave}
            disabled={saved}
            className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2
              ${saved
                ? 'bg-green-600 text-white'
                : 'bg-accent text-white hover:bg-accent/90 active:bg-accent/80'
              }`}
          >
            {saved ? (
              <>
                <Check size={16} />
                Enregistré
              </>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
