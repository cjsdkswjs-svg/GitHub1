import { WarningLightId, WarningLightSpec } from '../lib/daeriLogic';

interface WarningLightClusterProps {
  spec: WarningLightSpec;
}

const CLUSTER_ORDER: { id: WarningLightId; label: string }[] = [
  { id: 'master', label: '주의' },
  { id: 'engine', label: '엔진점검' },
  { id: 'blindspot', label: '사각지대' },
  { id: 'battery', label: '충전' },
];

function TelltaleIcon({
  id,
  active,
  color,
}: {
  id: WarningLightId;
  active: boolean;
  color: string;
}) {
  const strokeColor = active ? color : '#64748B';
  const strokeWidth = active ? 2.1 : 1.7;

  if (id === 'master') {
    return (
      <svg
        viewBox="0 0 36 36"
        className="h-8 w-8 sm:h-9 sm:w-9"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M18 5.5L31.2 28.5C31.7 29.4 31.1 30.5 30 30.5H6C4.9 30.5 4.3 29.4 4.8 28.5L18 5.5Z"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <line
          x1="18"
          y1="13.5"
          x2="18"
          y2="21.5"
          stroke={strokeColor}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
        <circle cx="18" cy="25.5" r="1.4" fill={strokeColor} />
      </svg>
    );
  }

  if (id === 'engine') {
    return (
      <svg
        viewBox="0 0 36 36"
        className="h-8 w-8 sm:h-9 sm:w-9"
        fill="none"
        aria-hidden="true"
      >
        {/* Top intake cap */}
        <line
          x1="13"
          y1="8.5"
          x2="21"
          y2="8.5"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <line
          x1="17"
          y1="8.5"
          x2="17"
          y2="12"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Left radiator / fan stem */}
        <line
          x1="5.5"
          y1="14"
          x2="5.5"
          y2="24"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <line
          x1="5.5"
          y1="19"
          x2="9"
          y2="19"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Engine block body */}
        <path
          d="M9 14.5H12.5L14.5 12H22.5L24.5 15H27.5V13.5H30.5V24.5H27.5V23H25L22.5 26.5H13.5L11.5 24H9V14.5Z"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Exclamation inside engine block when lit */}
        <line
          x1="18"
          y1="16"
          x2="18"
          y2="20.5"
          stroke={strokeColor}
          strokeWidth={1.9}
          strokeLinecap="round"
        />
        <circle cx="18" cy="23.2" r="1.1" fill={strokeColor} />
      </svg>
    );
  }

  if (id === 'blindspot') {
    return (
      <svg
        viewBox="0 0 36 36"
        className="h-8 w-8 sm:h-9 sm:w-9"
        fill="none"
        aria-hidden="true"
      >
        {/* Top-down compact car outline on left */}
        <rect
          x="6.5"
          y="8.5"
          width="11"
          height="19"
          rx="3.5"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        <path
          d="M8.5 14H15.5M8.5 22.5H15.5"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {/* Blind-spot detection waves on right */}
        <path
          d="M21.5 15C23 16.5 23 19.5 21.5 21"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d="M24.8 12.2C27.4 15.1 27.4 20.9 24.8 23.8"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d="M28.2 9.5C31.8 13.7 31.8 22.3 28.2 26.5"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 36 36"
      className="h-8 w-8 sm:h-9 sm:w-9"
      fill="none"
      aria-hidden="true"
    >
      {/* Battery terminals */}
      <rect
        x="9.5"
        y="9"
        width="4.5"
        height="3"
        rx="0.8"
        stroke={strokeColor}
        strokeWidth={1.6}
      />
      <rect
        x="22"
        y="9"
        width="4.5"
        height="3"
        rx="0.8"
        stroke={strokeColor}
        strokeWidth={1.6}
      />
      {/* Battery casing */}
      <rect
        x="6"
        y="12"
        width="24"
        height="15.5"
        rx="2.5"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      {/* Minus & Plus inside */}
      <line
        x1="10"
        y1="19.75"
        x2="14.5"
        y2="19.75"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <line
        x1="21.5"
        y1="19.75"
        x2="26"
        y2="19.75"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <line
        x1="23.75"
        y1="17.5"
        x2="23.75"
        y2="22"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function WarningLightCluster({ spec }: WarningLightClusterProps) {
  const activeColor = spec.isHighAlert ? '#FB923C' : '#FBBF24';
  const activeGlow = spec.isHighAlert
    ? 'radial-gradient(circle, rgba(251, 146, 60, 0.24) 0%, rgba(251, 146, 60, 0.04) 65%, transparent 100%)'
    : 'radial-gradient(circle, rgba(251, 191, 36, 0.24) 0%, rgba(251, 191, 36, 0.04) 65%, transparent 100%)';

  return (
    <div
      role="img"
      aria-label={`차량 계기판 경고등 패널: ${spec.title} 점등 (${spec.severityLabel})`}
      className="rounded-2xl border border-slate-700/80 bg-[#161E29] px-3.5 py-3.5 sm:px-4 sm:py-4 text-slate-100"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-700/70 pb-2.5">
        <span
          className="text-xs sm:text-sm font-bold tracking-tight"
          style={{ color: activeColor }}
        >
          {spec.title}
        </span>
        <span className="font-gauge text-[11px] font-semibold text-slate-300 whitespace-nowrap shrink-0">
          점등 · {spec.severityLabel}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5 sm:gap-2">
        {CLUSTER_ORDER.map((item) => {
          const isActive = item.id === spec.id;
          return (
            <div
              key={item.id}
              className="flex flex-col items-center justify-center rounded-xl py-2 px-1 transition-opacity"
              style={{
                background: isActive ? activeGlow : 'transparent',
                opacity: isActive ? 1 : 0.42,
              }}
            >
              <TelltaleIcon
                id={item.id}
                active={isActive}
                color={activeColor}
              />
              <span
                className="mt-1 text-[11px] font-semibold whitespace-nowrap"
                style={{
                  color: isActive ? activeColor : '#94A3B8',
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
