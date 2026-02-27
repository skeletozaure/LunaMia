import { Home, CalendarDays, BarChart3, Settings, Info } from 'lucide-react';
import type { TabId } from '../types';

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; Icon: typeof Home }[] = [
  { id: 'dashboard', label: 'Accueil', Icon: Home },
  { id: 'calendar', label: 'Calendrier', Icon: CalendarDays },
  { id: 'stats', label: 'Stats', Icon: BarChart3 },
  { id: 'settings', label: 'Paramètres', Icon: Settings },
  { id: 'about', label: 'À propos', Icon: Info },
];

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl bg-background/80 shadow-[0_-2px_24px_rgba(0,0,0,0.25)] safe-bottom">
      <div className="mx-auto max-w-lg flex">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition-all duration-200
                ${isActive ? 'text-accent' : 'text-muted hover:text-foreground'}`}
            >
              <span className={`flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200
                ${isActive ? 'bg-accent/12 scale-110' : ''}`}>
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.6} />
              </span>
              <span className={isActive ? 'font-medium' : ''}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
