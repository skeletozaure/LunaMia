import { useState, useRef } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../hooks/useTheme';
import { exportData, importData, resetAllData } from '../utils/dataExport';
import { APP_VERSION } from '../utils/constants';
import ConfirmModal from '../components/ConfirmModal';
import { Download, Upload, Trash2, Check, AlertCircle } from 'lucide-react';
import type { ThemeMode } from '../types';

export default function Settings() {
  const { cycleLength, periodLength, setSetting } = useSettings();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [confirmReset, setConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  async function handleExport() {
    await exportData();
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await importData(file);
    if (result.success) {
      setImportStatus({ type: 'success', msg: 'Données restaurées avec succès.' });
    } else {
      setImportStatus({ type: 'error', msg: result.error ?? 'Erreur inconnue.' });
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setImportStatus(null), 4000);
  }

  async function handleReset() {
    await resetAllData();
    setConfirmReset(false);
  }

  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: 'system', label: 'Système' },
    { value: 'light', label: 'Clair' },
    { value: 'dark', label: 'Sombre' },
  ];

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-lg font-semibold text-foreground">Paramètres</h1>

      {/* Cycle settings */}
      <section className="bg-surface rounded-xl p-4 shadow-sm border border-border space-y-4">
        <h2 className="text-sm font-medium text-foreground">Cycle</h2>

        <div className="flex items-center justify-between">
          <label htmlFor="cycleLen" className="text-sm text-muted">Durée moyenne du cycle</label>
          <div className="flex items-center gap-1">
            <input
              id="cycleLen"
              type="number"
              min={20}
              max={45}
              value={cycleLength}
              onChange={(e) => setSetting('cycleLength', Math.max(20, Math.min(45, Number(e.target.value))))}
              className="w-16 text-center text-sm py-1 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <span className="text-xs text-muted">jours</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="periodLen" className="text-sm text-muted">Durée moyenne des règles</label>
          <div className="flex items-center gap-1">
            <input
              id="periodLen"
              type="number"
              min={1}
              max={10}
              value={periodLength}
              onChange={(e) => setSetting('periodLength', Math.max(1, Math.min(10, Number(e.target.value))))}
              className="w-16 text-center text-sm py-1 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <span className="text-xs text-muted">jours</span>
          </div>
        </div>
      </section>

      {/* Theme */}
      <section className="bg-surface rounded-xl p-4 shadow-sm border border-border space-y-3">
        <h2 className="text-sm font-medium text-foreground">Apparence</h2>
        <div className="flex gap-2">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`flex-1 py-2 text-xs rounded-lg transition-colors
                ${theme === opt.value
                  ? 'bg-accent text-white'
                  : 'bg-surface-alt text-foreground hover:bg-surface-alt/80'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Data management */}
      <section className="bg-surface rounded-xl p-4 shadow-sm border border-border space-y-3">
        <h2 className="text-sm font-medium text-foreground">Données</h2>

        <button
          onClick={handleExport}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-surface-alt text-foreground hover:bg-surface-alt/80 transition-colors"
        >
          <Download size={16} />
          Exporter (JSON)
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-surface-alt text-foreground hover:bg-surface-alt/80 transition-colors"
        >
          <Upload size={16} />
          Importer une sauvegarde
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        {importStatus && (
          <div
            className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${
              importStatus.type === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {importStatus.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
            {importStatus.msg}
          </div>
        )}

        <button
          onClick={() => setConfirmReset(true)}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 size={16} />
          Réinitialiser toutes les données
        </button>
      </section>

      {/* Version */}
      <p className="text-center text-xs text-muted/50">LunaMia v{APP_VERSION}</p>

      <ConfirmModal
        open={confirmReset}
        title="Réinitialiser les données"
        message="Toutes vos données seront définitivement supprimées. Cette action est irréversible."
        confirmLabel="Supprimer tout"
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
