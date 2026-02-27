import type { PhaseRange, CyclePhase } from '../types';
import { PHASE_COLORS } from '../utils/constants';

interface Props {
  currentDay: number | null;
  totalDays: number;
  phases: PhaseRange[];
  phase: CyclePhase;
}

const SIZE = 220;
const STROKE = 18;
const RADIUS = (SIZE - STROKE) / 2;
const CENTER = SIZE / 2;

/** Convert a day‑in‑cycle (1‑based) to an angle. Day 1 = top (‑90°). */
function dayToAngle(day: number, total: number): number {
  return ((day - 1) / total) * 360 - 90;
}

/** Polar → Cartesian on the ring */
function polar(angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + RADIUS * Math.cos(rad), y: CENTER + RADIUS * Math.sin(rad) };
}

/** Build an SVG arc path for a segment of the ring */
function arcPath(startAngle: number, endAngle: number): string {
  let sweep = endAngle - startAngle;
  if (sweep <= 0) sweep += 360;
  const largeArc = sweep > 180 ? 1 : 0;
  const start = polar(startAngle);
  const end = polar(endAngle);
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export default function CycleRing({ currentDay, totalDays, phases, phase }: Props) {
  const currentAngle = currentDay !== null ? dayToAngle(currentDay, totalDays) : null;
  const markerPos = currentAngle !== null ? polar(currentAngle) : null;
  const currentColor = PHASE_COLORS[phase]?.ring ?? PHASE_COLORS.unknown.ring;

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="block">
        {/* Background track */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          className="text-border"
          strokeWidth={STROKE}
        />

        {/* Phase arcs */}
        {phases.map((p) => {
          const startA = dayToAngle(p.startDay, totalDays);
          const endA = dayToAngle(p.endDay + 1, totalDays);
          return (
            <path
              key={p.phase}
              d={arcPath(startA, endA)}
              fill="none"
              stroke={PHASE_COLORS[p.phase]?.ring ?? '#999'}
              strokeWidth={STROKE}
              strokeLinecap="butt"
              opacity={phase === p.phase ? 1 : 0.35}
            />
          );
        })}

        {/* Current day marker — outer dot */}
        {markerPos && (
          <>
            <circle
              cx={markerPos.x}
              cy={markerPos.y}
              r={STROKE / 2 + 4}
              fill={currentColor}
              className="drop-shadow"
            />
            <circle
              cx={markerPos.x}
              cy={markerPos.y}
              r={STROKE / 2 - 1}
              fill="var(--color-background)"
            />
            <text
              x={markerPos.x}
              y={markerPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fontWeight={700}
              fill={currentColor}
            >
              J{currentDay}
            </text>
          </>
        )}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {currentDay !== null ? (
          <>
            <span className="text-4xl font-light" style={{ color: currentColor }}>
              J{currentDay}
            </span>
            <span className="text-xs font-medium text-foreground mt-0.5">
              {phases.find((p) => p.phase === phase)?.label ?? ''}
            </span>
          </>
        ) : (
          <span className="text-sm text-muted">Pas de données</span>
        )}
      </div>
    </div>
  );
}
