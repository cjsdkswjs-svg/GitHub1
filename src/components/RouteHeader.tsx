import { Car, Check } from 'lucide-react';
import {
  EmotionTheme,
  FontScale,
  ROUTE_STAGES,
  RouteStage,
} from '../lib/daeriLogic';

interface RouteHeaderProps {
  currentStage: 1 | 2 | 3 | 4;
  canAccessStage2: boolean;
  canAccessStage3: boolean;
  canAccessStage4: boolean;
  isDiaryOpen: boolean;
  onSelectStage: (stage: 1 | 2 | 3 | 4) => void;
  onOpenDiary: () => void;
  fontScale: FontScale;
  onChangeFontScale: (scale: FontScale) => void;
  theme: EmotionTheme;
}

const FONT_SCALE_OPTIONS: { key: FontScale; label: string }[] = [
  { key: 'normal', label: '보통' },
  { key: 'large', label: '크게' },
  { key: 'xlarge', label: '아주 크게' },
];

export function RouteHeader({
  currentStage,
  canAccessStage2,
  canAccessStage3,
  canAccessStage4,
  isDiaryOpen,
  onSelectStage,
  onOpenDiary,
  fontScale,
  onChangeFontScale,
  theme,
}: RouteHeaderProps) {
  const isStageClickable = (stageId: RouteStage['id']) => {
    if (stageId === 1) return true;
    if (stageId === 2) return canAccessStage2;
    if (stageId === 3) return canAccessStage3;
    if (stageId === 4) return canAccessStage4;
    if (stageId === 5) return true;
    return false;
  };

  const handleStageClick = (stage: RouteStage) => {
    if (stage.id === 5) {
      onOpenDiary();
      return;
    }
    if (
      isStageClickable(stage.id) &&
      (stage.id === 1 || stage.id === 2 || stage.id === 3 || stage.id === 4)
    ) {
      onSelectStage(stage.id);
    }
  };

  return (
    <header
      className="theme-transition relative z-20 border-b backdrop-blur-md"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.86)',
        borderColor: theme.border,
      }}
    >
      {/* Top 3-zone bar */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-3">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectStage(1)}
          className="flex min-h-[44px] min-w-0 shrink-0 items-center gap-2 rounded-xl px-0.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-1 sm:gap-2.5"
          style={{ color: theme.textPrimary, outlineColor: theme.accent }}
          aria-label="대리기사 처음으로 돌아가기"
        >
          <span
            className="theme-transition flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-white shrink-0"
            style={{ backgroundColor: theme.accent }}
            aria-hidden="true"
          >
            <Car className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
          <span className="font-diary text-[18px] sm:text-xl font-bold tracking-tight whitespace-nowrap">
            대리기사
          </span>
        </button>

        {/* Zone 2: Desktop 5-stage Navigation Route Line */}
        <nav
          aria-label="운행 진행 단계"
          className="hidden lg:flex items-center"
        >
          <ol className="flex items-center">
            {ROUTE_STAGES.map((stage, idx) => {
              const isActive = stage.id === 5 ? isDiaryOpen : !isDiaryOpen && stage.id === currentStage;
              const isCompleted = stage.id < currentStage;
              const isClickable = isStageClickable(stage.id);

              return (
                <li key={stage.id} className="flex items-center">
                  <button
                    type="button"
                    disabled={!isClickable}
                    onClick={() => handleStageClick(stage)}
                    aria-current={stage.id !== 5 && stage.id === currentStage ? 'step' : undefined}
                    aria-expanded={stage.id === 5 ? isDiaryOpen : undefined}
                    className={`theme-transition flex min-h-[40px] items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      isClickable
                        ? 'cursor-pointer hover:bg-black/5'
                        : 'cursor-default opacity-55'
                    }`}
                    style={{
                      color: isActive ? theme.accentText : theme.textSecondary,
                      fontWeight: isActive ? 700 : 500,
                      outlineColor: theme.accent,
                    }}
                  >
                    <span
                      className="theme-transition flex h-6 w-6 items-center justify-center rounded-full text-xs font-gauge font-semibold"
                      style={{
                        backgroundColor: isActive
                          ? theme.accent
                          : isCompleted
                            ? theme.accentSoft
                            : 'transparent',
                        color: isActive
                          ? '#FFFFFF'
                          : isCompleted
                            ? theme.accentText
                            : theme.textSecondary,
                        border:
                          isActive || isCompleted
                            ? `1.5px solid ${theme.accent}`
                            : `1.5px solid ${theme.border}`,
                      }}
                    >
                      {isCompleted ? (
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        stage.id
                      )}
                    </span>
                    <span>{stage.label}</span>
                  </button>

                  {idx < ROUTE_STAGES.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="mx-1 h-[2px] w-6 rounded-full theme-transition"
                      style={{
                        backgroundColor:
                          stage.id < currentStage ? theme.accent : theme.border,
                      }}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Zone 3: Font Size Accessibility Control */}
        <div
          className="flex shrink-0 items-center gap-0.5 sm:gap-1 rounded-xl border p-[3px] sm:p-1"
          style={{
            backgroundColor: theme.bgSubtle,
            borderColor: theme.border,
          }}
          role="group"
          aria-label="글자 크기 조절"
        >
          {FONT_SCALE_OPTIONS.map((opt) => {
            const active = fontScale === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onChangeFontScale(opt.key)}
                aria-pressed={active}
                className="theme-transition min-h-[36px] rounded-lg px-[7px] sm:px-2.5 py-1 text-[12px] sm:text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1"
                style={{
                  backgroundColor: active ? '#FFFFFF' : 'transparent',
                  color: active ? theme.accentText : theme.textSecondary,
                  boxShadow: active ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                  outlineColor: theme.accent,
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Compact Mobile/Tablet Navigation Route Line */}
      <nav
        aria-label="모바일 운행 진행 단계"
        className="border-t px-2 py-2 sm:px-3 lg:hidden overflow-hidden"
        style={{ borderColor: theme.border }}
      >
        <ol className="mx-auto flex max-w-6xl items-center justify-between gap-0.5">
          {ROUTE_STAGES.map((stage, idx) => {
            const isActive = stage.id === 5 ? isDiaryOpen : !isDiaryOpen && stage.id === currentStage;
            const isCompleted = stage.id < currentStage;
            const isClickable = isStageClickable(stage.id);
            const mobileLabel =
              stage.id === 4 ? '리포트' : stage.id === 5 ? '일기' : stage.label;

            return (
              <li key={stage.id} className="flex items-center flex-1 last:flex-none min-w-0">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => handleStageClick(stage)}
                  aria-current={stage.id !== 5 && stage.id === currentStage ? 'step' : undefined}
                  aria-expanded={stage.id === 5 ? isDiaryOpen : undefined}
                  aria-label={stage.id === 5 ? '5단계 마음 일기 열기' : `${stage.id}단계 ${stage.label}`}
                  className={`flex items-center gap-1 rounded-lg px-1 py-1 text-[11px] whitespace-nowrap shrink-0 ${
                    isClickable ? 'cursor-pointer' : 'cursor-default opacity-55'
                  }`}
                  style={{
                    color: isActive ? theme.accentText : theme.textSecondary,
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-gauge font-semibold shrink-0"
                    style={{
                      backgroundColor: isActive
                        ? theme.accent
                        : isCompleted
                          ? theme.accentSoft
                          : '#FFFFFF',
                      color: isActive
                        ? '#FFFFFF'
                        : isCompleted
                          ? theme.accentText
                          : theme.textSecondary,
                      border: `1.5px solid ${
                        isActive || isCompleted ? theme.accent : theme.border
                      }`,
                    }}
                  >
                    {stage.id}
                  </span>
                  <span className="sm:hidden">{mobileLabel}</span>
                  <span className="hidden sm:inline">{stage.label}</span>
                </button>

                {idx < ROUTE_STAGES.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="mx-0.5 h-[1.5px] flex-1 min-w-[4px] rounded-full"
                    style={{
                      backgroundColor:
                        stage.id < currentStage ? theme.accent : theme.border,
                    }}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </header>
  );
}
