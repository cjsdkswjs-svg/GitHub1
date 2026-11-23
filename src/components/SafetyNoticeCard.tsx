import { HeartHandshake, PhoneCall, RotateCcw, ShieldAlert } from 'lucide-react';
import { EmotionTheme, SafetyAssessment } from '../lib/daeriLogic';

interface SafetyNoticeCardProps {
  assessment: SafetyAssessment;
  theme: EmotionTheme;
  onReset: () => void;
}

const CRISIS_HELPLINES = [
  { name: '자살예방 상담전화', number: '109', hours: '24시간 무료 상담' },
  { name: '청소년 전화', number: '1388', hours: '학생·청소년 24시간' },
  { name: '정신건강 상담전화', number: '1577-0199', hours: '24시간 위기 지원' },
];

export function SafetyNoticeCard({
  assessment,
  theme,
  onReset,
}: SafetyNoticeCardProps) {
  const isCrisis = assessment.level === 'crisis';

  return (
    <section
      role="alert"
      aria-live="assertive"
      className="mx-auto max-w-2xl rounded-3xl border bg-white p-6 sm:p-8 shadow-sm"
      style={{
        borderColor: isCrisis ? '#DC2626' : theme.border,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: isCrisis ? '#FEE2E2' : theme.accentSoft,
            color: isCrisis ? '#B91C1C' : theme.accentText,
          }}
        >
          {isCrisis ? (
            <HeartHandshake className="h-6 w-6" aria-hidden="true" />
          ) : (
            <ShieldAlert className="h-6 w-6" aria-hidden="true" />
          )}
        </div>

        <div className="space-y-3">
          <h2
            className="font-diary text-xl sm:text-2xl font-bold leading-snug"
            style={{ color: theme.textPrimary }}
          >
            {assessment.title}
          </h2>
          <p
            className="text-base leading-relaxed"
            style={{ color: theme.textSecondary }}
          >
            {assessment.guidance}
          </p>
        </div>
      </div>

      {isCrisis && (
        <div className="mt-6 space-y-3 border-t pt-6" style={{ borderColor: theme.border }}>
          <p
            className="text-sm font-semibold"
            style={{ color: theme.textPrimary }}
          >
            지금 바로 연결할 수 있는 도움 기관
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {CRISIS_HELPLINES.map((line) => (
              <div
                key={line.number}
                className="rounded-2xl border p-4"
                style={{
                  backgroundColor: '#FEF2F2',
                  borderColor: '#FECACA',
                }}
              >
                <div className="flex items-center gap-1.5 text-xs font-medium text-red-800">
                  <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{line.name}</span>
                </div>
                <p className="mt-1.5 font-gauge text-xl font-bold text-red-900">
                  {line.number}
                </p>
                <p className="mt-0.5 text-xs text-red-700">{line.hours}</p>
              </div>
            ))}
          </div>
          <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>
            가까운 담임선생님, 학교 상담실(Wee 클래스), 가족 또는 믿을 수 있는 어른에게
            지금 겪고 있는 마음을 꼭 알려 주세요.
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white cursor-pointer transition-opacity hover:opacity-90"
          style={{ backgroundColor: theme.accent }}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>{isCrisis ? '처음 화면으로 돌아가기' : '마음 정리 글 다시 쓰기'}</span>
        </button>
      </div>
    </section>
  );
}
