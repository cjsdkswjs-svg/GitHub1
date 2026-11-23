import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Compass,
  Gauge,
  Navigation,
  RefreshCw,
  Scale,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  AnalystResult,
  BoardingInput,
  EmotionTheme,
  selectWarningLight,
} from '../lib/daeriLogic';
import { SemicircularGauge } from './SemicircularGauge';
import { WarningLightCluster } from './WarningLightCluster';

interface DashboardScreenProps {
  input: BoardingInput;
  analysis: AnalystResult | null;
  theme: EmotionTheme;
  isLoading: boolean;
  errorMessage: string | null;
  onBackToBoarding: () => void;
  onRetryAnalyze: () => void;
  onStartDriving: () => void;
}

export function DashboardScreen({
  input,
  analysis,
  theme,
  isLoading,
  errorMessage,
  onBackToBoarding,
  onRetryAnalyze,
  onStartDriving,
}: DashboardScreenProps) {
  if (isLoading) {
    return (
      <section
        aria-live="polite"
        aria-label="마음 계기판 분석 중"
        className="space-y-6"
      >
        <div
          className="rounded-3xl border bg-white p-6 sm:p-8 shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-3">
            <RefreshCw
              className="h-5 w-5 animate-spin"
              style={{ color: theme.accent }}
              aria-hidden="true"
            />
            <h2
              className="font-diary text-xl font-bold"
              style={{ color: theme.textPrimary }}
            >
              기사님이 마음 계기판을 천천히 읽고 있어요
            </h2>
          </div>
          <p className="mt-2 text-sm" style={{ color: theme.textSecondary }}>
            감정 단어 3가지, 핵심 고민, 놓치고 있을 수 있는 부분과 충돌하는 가치를
            정리하는 중입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[0, 1, 2, 3].map((slot) => (
            <div
              key={slot}
              className="h-56 animate-pulse rounded-3xl border bg-white p-6"
              style={{ borderColor: theme.border }}
            >
              <div
                className="h-4 w-32 rounded"
                style={{ backgroundColor: theme.bgSubtle }}
              />
              <div
                className="mt-5 h-6 w-3/4 rounded"
                style={{ backgroundColor: theme.bgSubtle }}
              />
              <div
                className="mt-3 h-4 w-full rounded"
                style={{ backgroundColor: theme.bgSubtle }}
              />
              <div
                className="mt-2 h-4 w-5/6 rounded"
                style={{ backgroundColor: theme.bgSubtle }}
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (errorMessage || !analysis) {
    return (
      <section
        role="alert"
        className="mx-auto max-w-2xl rounded-3xl border bg-white p-6 sm:p-8 shadow-sm"
        style={{ borderColor: theme.border }}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800"
            aria-hidden="true"
          >
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2
              className="font-diary text-xl font-bold"
              style={{ color: theme.textPrimary }}
            >
              계기판 신호를 잠시 읽어오지 못했어요
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>
              {errorMessage ||
                '분석 데이터를 확인하지 못했습니다. 다시 한 번 점검해 주세요.'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onRetryAnalyze}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white cursor-pointer hover:opacity-90"
            style={{ backgroundColor: theme.accent }}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>다시 점검하기</span>
          </button>
          <button
            type="button"
            onClick={onBackToBoarding}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold cursor-pointer hover:bg-black/5"
            style={{
              borderColor: theme.border,
              color: theme.textPrimary,
            }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>탑승 화면으로 돌아가기</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Summary Strip */}
      <section
        className="theme-transition rounded-3xl border bg-white p-6 sm:p-7 shadow-sm"
        style={{ borderColor: theme.border }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div
              className="flex flex-wrap items-center gap-2 text-xs font-medium"
              style={{ color: theme.textSecondary }}
            >
              <span>2단계 · 마음 계기판 진단</span>
              <span aria-hidden="true">·</span>
              <span>{input.category}</span>
              <span aria-hidden="true">·</span>
              <span>선택 감정 {input.emotion}</span>
            </div>
            <h1
              className="font-diary mt-1.5 text-2xl sm:text-3xl font-bold leading-snug text-balance"
              style={{ color: theme.textPrimary }}
            >
              지금 마음 상태를 계기판 4장에 담았어요
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onBackToBoarding}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                borderColor: theme.border,
                color: theme.textPrimary,
                outlineColor: theme.accent,
              }}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>탑승 화면으로</span>
            </button>
            <button
              type="button"
              onClick={onRetryAnalyze}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: theme.accent,
                outlineColor: theme.accent,
              }}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span>다시 점검하기</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4 Dashboard Cards (2x2 Grid) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Card 1: 3 Emotion Words + Semicircular Intensity Gauge */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.04 }}
          className="theme-transition flex flex-col justify-between rounded-3xl border bg-white p-6 sm:p-7 shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Gauge
                  className="h-5 w-5"
                  style={{ color: theme.accent }}
                  aria-hidden="true"
                />
                <h2
                  className="text-base font-bold"
                  style={{ color: theme.textPrimary }}
                >
                  01. 마음 속도계 · 감정 단어 3가지
                </h2>
              </div>
            </div>

            <div className="mt-5 flex justify-center">
              <SemicircularGauge intensity={analysis.intensity} theme={theme} />
            </div>
          </div>

          <div
            className="mt-6 border-t pt-4"
            style={{ borderColor: theme.border }}
          >
            <p
              className="text-xs font-medium mb-2.5"
              style={{ color: theme.textSecondary }}
            >
              지금 마음속에서 읽힌 세 가지 감정 결
            </p>
            <ol className="grid grid-cols-3 gap-2">
              {analysis.emotions.map((word, idx) => (
                <li
                  key={`${word}-${idx}`}
                  className="rounded-xl px-3 py-2.5 text-center"
                  style={{ backgroundColor: theme.bgSubtle }}
                >
                  <span
                    className="block font-gauge text-[11px]"
                    style={{ color: theme.textSecondary }}
                  >
                    0{idx + 1}
                  </span>
                  <span
                    className="mt-0.5 block text-sm sm:text-base font-bold"
                    style={{ color: theme.accentText }}
                  >
                    {word}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </motion.article>

        {/* Card 2: Core Concern Sentence */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12 }}
          className="theme-transition flex flex-col justify-between rounded-3xl border bg-white p-6 sm:p-7 shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <div>
            <div className="flex items-center gap-2">
              <Navigation
                className="h-5 w-5"
                style={{ color: theme.accent }}
                aria-hidden="true"
              />
              <h2
                className="text-base font-bold"
                style={{ color: theme.textPrimary }}
              >
                02. 오늘의 핵심 목적지
              </h2>
            </div>

            <p
              className="mt-2 text-xs"
              style={{ color: theme.textSecondary }}
            >
              고민 속에서 가장 먼저 살펴야 할 중심 문장
            </p>

            <blockquote
              className="font-diary mt-6 text-xl sm:text-2xl font-bold leading-relaxed"
              style={{ color: theme.textPrimary }}
            >
              “{analysis.core}”
            </blockquote>
          </div>

          <div
            className="mt-8 border-t pt-4 text-xs leading-relaxed"
            style={{
              borderColor: theme.border,
              color: theme.textSecondary,
            }}
          >
            내가 직접 적은 표현을 바탕으로 핵심만 한 문장으로 모았습니다.
          </div>
        </motion.article>

        {/* Card 3: Blindspot Warning Light */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="theme-transition flex flex-col justify-between rounded-3xl border bg-white p-6 sm:p-7 shadow-sm"
          style={{ borderColor: theme.border }}
        >
          {(() => {
            const warningSpec = selectWarningLight(
              analysis.blindspot,
              analysis.intensity,
              input.emotion,
            );
            return (
              <>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle
                        className="h-5 w-5 shrink-0"
                        style={{ color: warningSpec.isHighAlert ? '#C2410C' : '#B45309' }}
                        aria-hidden="true"
                      />
                      <h2
                        className="text-base font-bold truncate"
                        style={{ color: theme.textPrimary }}
                      >
                        03. 마음 경고등 · 놓치고 있을 수 있는 부분
                      </h2>
                    </div>
                  </div>

                  <div className="mt-4">
                    <WarningLightCluster spec={warningSpec} />
                  </div>

                  <p
                    className="mt-5 text-base sm:text-lg leading-relaxed"
                    style={{ color: theme.textPrimary }}
                  >
                    {analysis.blindspot}
                  </p>
                </div>

                <div
                  className="mt-7 border-t pt-4 text-xs leading-relaxed"
                  style={{
                    borderColor: theme.border,
                    color: theme.textSecondary,
                  }}
                >
                  경고등은 잘못을 지적하려는 것이 아니라, 사각지대를 함께 비춰 보는 신호예요.
                </div>
              </>
            );
          })()}
        </motion.article>

        {/* Card 4: Conflicting Values Compass */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.28 }}
          className="theme-transition flex flex-col justify-between rounded-3xl border bg-white p-6 sm:p-7 shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <div>
            <div className="flex items-center gap-2">
              <Scale
                className="h-5 w-5"
                style={{ color: theme.accent }}
                aria-hidden="true"
              />
              <h2
                className="text-base font-bold"
                style={{ color: theme.textPrimary }}
              >
                04. 충돌하는 가치 · 마음의 저울
              </h2>
            </div>

            <p
              className="mt-2 text-xs"
              style={{ color: theme.textSecondary }}
            >
              둘 다 소중하기 때문에 갈등이 생기는 가치들이에요
            </p>

            <div className="mt-6 space-y-4">
              {analysis.values.length >= 2 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {analysis.values.map((val, idx) => (
                      <div
                        key={`${val}-${idx}`}
                        className="rounded-2xl p-4"
                        style={{ backgroundColor: theme.bgSubtle }}
                      >
                        <span
                          className="font-gauge text-[11px]"
                          style={{ color: theme.textSecondary }}
                        >
                          가치 0{idx + 1}
                        </span>
                        <p
                          className="mt-1 text-base font-bold"
                          style={{ color: theme.accentText }}
                        >
                          {val}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div
                    className="flex items-center gap-2 pt-1 text-xs"
                    style={{ color: theme.textSecondary }}
                  >
                    <Compass className="h-4 w-4 shrink-0" style={{ color: theme.accent }} aria-hidden="true" />
                    <span>
                      어느 한쪽이 틀린 것이 아니라, 두 가치가 함께 균형을 찾고 싶어 합니다.
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className="rounded-2xl p-4"
                  style={{ backgroundColor: theme.bgSubtle }}
                >
                  <p
                    className="text-base font-bold"
                    style={{ color: theme.accentText }}
                  >
                    {analysis.values[0]}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div
            className="mt-8 border-t pt-4 text-xs leading-relaxed"
            style={{
              borderColor: theme.border,
              color: theme.textSecondary,
            }}
          >
            가치를 알고 나면, 상대에게 전할 말의 방향도 훨씬 분명해집니다.
          </div>
        </motion.article>
      </div>

      {/* Stage 3 Launch Card */}
      <section
        className="theme-transition rounded-3xl border bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{ borderColor: theme.border }}
      >
        <div className="space-y-1">
          <p
            className="text-xs font-semibold"
            style={{ color: theme.accentText }}
          >
            목적지 점검 완료 · 3단계 운행 출발
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: theme.textSecondary }}
          >
            이제 계기판이 모두 맞춰졌습니다. 기사님과 편한 모드를 골라 대화를 나누러
            출발해 볼까요?
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onBackToBoarding}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer hover:bg-black/5"
            style={{
              borderColor: theme.border,
              color: theme.textPrimary,
            }}
          >
            <span>다른 고민 적어보기</span>
          </button>
          <button
            type="button"
            onClick={onStartDriving}
            className="theme-transition inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: theme.accent,
              outlineColor: theme.accent,
            }}
          >
            <span>운행 시작하기</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  );
}
