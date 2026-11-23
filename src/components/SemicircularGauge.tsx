import { computeGaugeGeometry, EmotionTheme } from '../lib/daeriLogic';

interface SemicircularGaugeProps {
  intensity: number;
  theme: EmotionTheme;
  size?: 'md' | 'sm';
}

export function SemicircularGauge({
  intensity,
  theme,
  size = 'md',
}: SemicircularGaugeProps) {
  const radius = 86;
  const centerX = 110;
  const centerY = 104;
  const geo = computeGaugeGeometry(intensity, radius, centerX, centerY);

  const ticks = Array.from({ length: 10 }, (_, idx) => {
    const val = idx + 1;
    const ratio = val / 10;
    const angleRad = Math.PI * (1 - ratio);
    const outerR = radius + 9;
    const innerR = radius + 3;
    const x1 = centerX + innerR * Math.cos(angleRad);
    const y1 = centerY - innerR * Math.sin(angleRad);
    const x2 = centerX + outerR * Math.cos(angleRad);
    const y2 = centerY - outerR * Math.sin(angleRad);
    return { val, x1, y1, x2, y2, active: val <= geo.clampedValue };
  });

  const widthClass = size === 'sm' ? 'w-40' : 'w-56 sm:w-64';

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 220 124"
        className={`${widthClass} overflow-visible`}
        role="img"
        aria-label={`감정 강도 게이지 10점 만점 중 ${geo.clampedValue}점, ${geo.statusLabel}`}
      >
        {/* Tick marks */}
        {ticks.map((t) => (
          <line
            key={t.val}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.active ? theme.accent : theme.border}
            strokeWidth={t.val === 5 || t.val === 10 ? 2.5 : 1.5}
            strokeLinecap="round"
          />
        ))}

        {/* Background semicircular track */}
        <path
          d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${
            centerX + radius
          } ${centerY}`}
          fill="none"
          stroke={theme.gaugeTrack}
          strokeWidth={14}
          strokeLinecap="round"
        />

        {/* Active semicircular arc */}
        <path
          d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${
            centerX + radius
          } ${centerY}`}
          fill="none"
          stroke={theme.accent}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={geo.arcLength}
          strokeDashoffset={geo.dashOffset}
          style={{
            transition: 'stroke-dashoffset 700ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Gauge Needle */}
        <line
          x1={centerX}
          y1={centerY}
          x2={geo.needleTipX}
          y2={geo.needleTipY}
          stroke={theme.textPrimary}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={6}
          fill={theme.accent}
          stroke="#FFFFFF"
          strokeWidth={2.5}
        />

        {/* Min / Max scale labels */}
        <text
          x={centerX - radius - 4}
          y={centerY + 18}
          textAnchor="middle"
          className="font-gauge text-[11px]"
          fill={theme.textSecondary}
        >
          1
        </text>
        <text
          x={centerX + radius + 4}
          y={centerY + 18}
          textAnchor="middle"
          className="font-gauge text-[11px]"
          fill={theme.textSecondary}
        >
          10
        </text>
      </svg>

      <div className="mt-2 flex items-baseline gap-2">
        <span
          className="font-gauge text-3xl font-semibold tracking-tight"
          style={{ color: theme.textPrimary }}
        >
          {geo.clampedValue}
        </span>
        <span
          className="font-gauge text-sm"
          style={{ color: theme.textSecondary }}
        >
          / 10
        </span>
        <span
          aria-hidden="true"
          className="mx-0.5 text-sm"
          style={{ color: theme.border }}
        >
          ·
        </span>
        <span
          className="text-sm font-medium"
          style={{ color: theme.accentText }}
        >
          {geo.statusLabel}
        </span>
      </div>
    </div>
  );
}
