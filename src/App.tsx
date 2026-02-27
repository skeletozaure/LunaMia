import { useState } from 'react';
import { format } from 'date-fns';
import { useTheme } from './hooks/useTheme';
import BottomNav from './components/BottomNav';
import Dashboard from './screens/Dashboard';
import Calendar from './screens/Calendar';
import Stats from './screens/Stats';
import Settings from './screens/Settings';
import DayEntry from './screens/DayEntry';
import type { TabId } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [entryDate, setEntryDate] = useState<string | null>(null);

  // Initialize theme
  useTheme();

  function openDay(date: string) {
    setEntryDate(date);
  }

  function openToday() {
    openDay(format(new Date(), 'yyyy-MM-dd'));
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-lg pb-20">
        {activeTab === 'dashboard' && <Dashboard onOpenToday={openToday} />}
        {activeTab === 'calendar' && <Calendar onSelectDate={openDay} />}
        {activeTab === 'stats' && <Stats />}
        {activeTab === 'settings' && <Settings />}
      </div>

      <BottomNav active={activeTab} onChange={setActiveTab} />

      {entryDate && (
        <DayEntry date={entryDate} onClose={() => setEntryDate(null)} />
      )}
    </div>
  );
}
