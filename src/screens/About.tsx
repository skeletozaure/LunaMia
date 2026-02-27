import { Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="p-4 space-y-5">
      {/* ===== Logo ===== */}
      <div className="animate-fade-in-up flex flex-col items-center pt-4 space-y-3">
        <img
          src="/img/Logo.png"
          alt="LunaMia"
          className="h-40 w-auto drop-shadow-lg"
        />
        <p className="text-xs text-muted">Ton cycle, en douceur.</p>
      </div>

      {/* ===== Description ===== */}
      <section className="animate-fade-in-up delay-1 bg-surface rounded-2xl p-5 shadow-sm border border-border space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Qu'est-ce que LunaMia ?
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          LunaMia est une application de suivi de cycle menstruel conçue pour
          t'accompagner au quotidien avec douceur et simplicité.
        </p>
        <ul className="space-y-2 text-sm text-muted leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
            <span>
              <strong className="text-foreground">Suivi quotidien</strong> —
              Note ton flux, ton humeur, et tes symptômes en quelques secondes.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-secondary shrink-0" />
            <span>
              <strong className="text-foreground">Calendrier visuel</strong> —
              Visualise tes cycles passés et à venir d'un coup d'œil grâce au
              calendrier coloré par phases.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-ovulation shrink-0" />
            <span>
              <strong className="text-foreground">Insights personnalisés</strong>{' '}
              — Reçois des observations sur la régularité de tes cycles, les
              phases à venir et les tendances de ton corps.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-luteal shrink-0" />
            <span>
              <strong className="text-foreground">100 % confidentielle</strong> —
              Toutes tes données restent sur ton appareil. Aucun compte, aucun
              serveur, aucune collecte.
            </span>
          </li>
        </ul>
      </section>

      {/* ===== Crédits ===== */}
      <section className="animate-fade-in-up delay-2 bg-surface rounded-2xl p-5 shadow-sm border border-border text-center space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted flex items-center justify-center gap-1">
          Conçu avec
          <Heart size={12} className="text-accent" />
          par
        </p>
        <p className="text-base font-semibold text-foreground">
          LEBOCQ Cédric
        </p>
      </section>
    </div>
  );
}
