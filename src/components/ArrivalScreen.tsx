import { ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import {
  AnalystResult,
  BoardingInput,
  ChatMessage,
  DrivingMode,
  EmotionTheme,
  getDrivingModeOption,
} from '../lib/daeriLogic';

interface ArrivalScreenProps {
  input: BoardingInput;
  analysis: AnalystResult | null;
  messages: ChatMessage[];
  lastMode: DrivingMode;
  theme: EmotionTheme;
  onBackToDriving: () => void;
  onStartNewRide: () => void;
}

export function ArrivalScreen({
  input,
  analysis,
  messages,
  lastMode,
  theme,
  onBackToDriving,
  onStartNewRide,
}: ArrivalScreenProps) {
  const userMessages = messages.filter((m) => m.role === 'user');
  const modeOption = getDrivingModeOption(lastMode);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section
        className="theme-transition rounded-3xl border bg-white p-6 sm:p-8 shadow-sm space-y-6"
        style={{ borderColor: theme.border }}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: theme.accentSoft,
              color: theme.accentText,
            }}
            aria-hidden="true"
          >
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div>
            <div
              className="flex flex-wrap items-center gap-1.5 text-xs font-medium"
              style={{ color: theme.textSecondary }}
            >
              <span>4단계 · 도착 리포트</span>
              <span aria-hidden="true">·</span>
              <span>{input.category}</span>
              <span aria-hidden="true">·</span>
              <span>{input.emotion}</span>
            </div>
            <h1
              className="font-diary mt-1 text-2xl sm:text-3xl font-bold leading-snug"
              style={{ color: theme.textPrimary }}
            >
              오늘의 마음 운행을 안전하게 마쳤어요
            </h1>
          </div>
        </div>

        <div
          className="grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-3"
          style={{ borderColor: theme.border }}
        >
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: theme.bgSubtle }}
          >
            <p className="text-xs" style={{ color: theme.textSecondary }}>
              나눈 대화 왕복
            </p>
            <p
              className="mt-1 font-gauge text-xl font-bold"
              style={{ color: theme.textPrimary }}
            >
              {userMessages.length}회
            </p>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: theme.bgSubtle }}
          >
            <p className="text-xs" style={{ color: theme.textSecondary }}>
              마지막 운행 모드
            </p>
            <p
              className="mt-1 text-base font-bold"
              style={{ color: theme.accentText }}
            >
              {modeOption.label}
            </p>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: theme.bgSubtle }}
          >
            <p className="text-xs" style={{ color: theme.textSecondary }}>
              시작 감정 강도
            </p>
            <p
              className="mt-1 font-gauge text-xl font-bold"
              style={{ color: theme.textPrimary }}
            >
              {analysis?.intensity ?? input.intensity} / 10
            </p>
          </div>
        </div>

        {analysis?.core && (
          <div
            className="border-t pt-6 space-y-2"
            style={{ borderColor: theme.border }}
          >
            <p className="text-xs font-semibold" style={{ color: theme.accentText }}>
              오늘 우리가 함께 살핀 목적지
            </p>
            <blockquote
              className="font-diary text-lg sm:text-xl font-medium leading-relaxed"
              style={{ color: theme.textPrimary }}
            >
              “{analysis.core}”
            </blockquote>
          </div>
        )}

        <div
          className="border-t pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{ borderColor: theme.border }}
        >
          <p className="text-xs leading-relaxed" style={{ color: theme.textSecondary }}>
            다음 요청에서 코치의 상세 도착 리포트와 “대신 말해주기” 3종 문장 다듬기,
            주행 기록 기능이 이어집니다.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onBackToDriving}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer hover:bg-black/5"
              style={{
                borderColor: theme.border,
                color: theme.textPrimary,
              }}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>운행으로 돌아가기</span>
            </button>

            <button
              type="button"
              onClick={onStartNewRide}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-5 py-2 text-sm font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer hover:opacity-90"
              style={{ backgroundColor: theme.accent }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>새 고민 탑승하기</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
