import { useState } from 'react';
import { ArrowRight, BookOpen, CarFront, Lock } from 'lucide-react';
import {
  BoardingInput,
  CONCERN_CATEGORIES,
  ConcernCategory,
  EMOTION_KEYS,
  EMOTION_THEMES,
  EmotionKey,
  EmotionTheme,
  getIntensityDescriptor,
  SAMPLE_CONCERNS,
  SampleConcern,
} from '../lib/daeriLogic';
import { SemicircularGauge } from './SemicircularGauge';

interface BoardingScreenProps {
  input: BoardingInput;
  theme: EmotionTheme;
  validationError: string | null;
  isLoading: boolean;
  onChange: (patch: Partial<BoardingInput>) => void;
  onSelectSample: (sample: SampleConcern) => void;
  onSubmit: () => void;
}

const DRIVER_AVATAR_PATH = '/src/assets/images/driver_avatar_1795141566539.jpg';

export function BoardingScreen({
  input,
  theme,
  validationError,
  isLoading,
  onChange,
  onSelectSample,
  onSubmit,
}: BoardingScreenProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
      {/* Left Column: Warm Driver Welcome & Live Emotion Atmosphere */}
      <aside className="lg:col-span-5 space-y-6">
        <div
          className="theme-transition rounded-3xl border bg-white p-6 sm:p-7 shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-4">
            {avatarFailed ? (
              <div
                className="theme-transition flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: theme.accentSoft,
                  color: theme.accentText,
                }}
                aria-hidden="true"
              >
                <CarFront className="h-9 w-9" />
              </div>
            ) : (
              <img
                src={DRIVER_AVATAR_PATH}
                alt="따뜻한 미소로 운전대를 잡고 있는 베테랑 대리기사 일러스트"
                referrerPolicy="no-referrer"
                onError={() => setAvatarFailed(true)}
                className="h-20 w-20 shrink-0 rounded-2xl object-cover border"
                style={{ borderColor: theme.border }}
              />
            )}

            <div className="min-w-0">
              <p
                className="text-xs font-medium tracking-wide"
                style={{ color: theme.textSecondary }}
              >
                오늘의 동행 · 베테랑 기사님
              </p>
              <h1
                className="font-diary mt-1 text-2xl font-bold leading-snug text-balance"
                style={{ color: theme.textPrimary }}
              >
                어디까지 모셔다 드릴까요?
              </h1>
            </div>
          </div>

          {/* Dynamic emotion message */}
          <div
            className="mt-6 border-t pt-5 space-y-2"
            style={{ borderColor: theme.border }}
          >
            <div
              className="flex items-center gap-2 text-xs font-semibold"
              style={{ color: theme.accentText }}
            >
              <span>선택한 마음 날씨</span>
              <span aria-hidden="true">·</span>
              <span>{theme.label}</span>
              <span aria-hidden="true">·</span>
              <span>{theme.toneName}</span>
            </div>
            <p
              className="font-diary text-lg font-medium leading-relaxed"
              style={{ color: theme.textPrimary }}
            >
              “{theme.driverPrompt}”
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: theme.textSecondary }}
            >
              {theme.subPrompt}
            </p>
          </div>

          {/* Live compact intensity gauge preview */}
          <div
            className="mt-6 border-t pt-5 flex flex-col items-center"
            style={{ borderColor: theme.border }}
          >
            <p
              className="mb-2 text-xs font-medium self-start"
              style={{ color: theme.textSecondary }}
            >
              탑승 전 마음 계기판 미리보기
            </p>
            <SemicircularGauge intensity={input.intensity} theme={theme} size="sm" />
          </div>
        </div>

        {/* Quick Sample Stories for Students & Teachers */}
        <div
          className="theme-transition rounded-3xl border bg-white p-6 shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-2">
            <BookOpen
              className="h-4 w-4 shrink-0"
              style={{ color: theme.accent }}
              aria-hidden="true"
            />
            <h2
              className="text-sm font-semibold"
              style={{ color: theme.textPrimary }}
            >
              어떤 말을 적어야 할지 막막하다면
            </h2>
          </div>
          <p
            className="mt-1.5 text-xs leading-relaxed"
            style={{ color: theme.textSecondary }}
          >
            학생과 선생님의 자주 있는 고민 예시를 불러와 고쳐 쓸 수 있어요.
          </p>

          <div className="mt-4 divide-y" style={{ borderColor: theme.border }}>
            {SAMPLE_CONCERNS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => onSelectSample(sample)}
                className="group flex w-full min-h-[48px] items-center justify-between gap-3 py-3 text-left cursor-pointer transition-colors hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  borderColor: theme.border,
                  outlineColor: theme.accent,
                }}
              >
                <div className="min-w-0">
                  <div
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: theme.textSecondary }}
                  >
                    <span className="font-semibold" style={{ color: theme.accentText }}>
                      {sample.roleLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{sample.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{sample.emotion}</span>
                  </div>
                  <p
                    className="mt-0.5 text-sm font-medium truncate"
                    style={{ color: theme.textPrimary }}
                  >
                    {sample.title}
                  </p>
                </div>
                <span
                  className="shrink-0 text-xs font-semibold whitespace-nowrap"
                  style={{ color: theme.accentText }}
                >
                  불러오기
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Right Column: Main Boarding Form Card */}
      <section className="lg:col-span-7">
        <form
          onSubmit={handleFormSubmit}
          noValidate
          className="theme-transition rounded-3xl border bg-white p-6 sm:p-8 shadow-sm space-y-8"
          style={{ borderColor: theme.border }}
        >
          {/* Step 1-1: Concern Category */}
          <fieldset className="space-y-3">
            <legend
              className="text-base font-bold"
              style={{ color: theme.textPrimary }}
            >
              1. 오늘의 목적지(고민 종류)를 골라 주세요
            </legend>
            <div className="flex flex-wrap gap-2.5">
              {CONCERN_CATEGORIES.map((category: ConcernCategory) => {
                const active = input.category === category;
                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onChange({ category })}
                    className="theme-transition min-h-[44px] rounded-xl border px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      backgroundColor: active ? theme.accent : '#FFFFFF',
                      borderColor: active ? theme.accent : theme.border,
                      color: active ? '#FFFFFF' : theme.textPrimary,
                      outlineColor: theme.accent,
                    }}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Step 1-2: Emotion Selector */}
          <div className="border-t pt-7" style={{ borderColor: theme.border }}>
            <fieldset className="space-y-3">
              <legend
                className="text-base font-bold"
                style={{ color: theme.textPrimary }}
              >
                2. 지금 마음과 가장 가까운 감정은 무엇인가요?
              </legend>
              <p className="text-xs" style={{ color: theme.textSecondary }}>
                감정을 고르면 화면 색감과 기사님의 인사말이 함께 맞춰집니다.
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                {EMOTION_KEYS.map((emotionKey: EmotionKey) => {
                  const active = input.emotion === emotionKey;
                  const itemTheme = EMOTION_THEMES[emotionKey];
                  return (
                    <button
                      key={emotionKey}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onChange({ emotion: emotionKey })}
                      className="theme-transition flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{
                        backgroundColor: active ? itemTheme.accentSoft : '#FFFFFF',
                        borderColor: active ? itemTheme.accent : theme.border,
                        color: active ? itemTheme.accentText : theme.textPrimary,
                        outlineColor: itemTheme.accent,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="h-3 w-3 rounded-full shrink-0 border"
                        style={{
                          backgroundColor: itemTheme.accent,
                          borderColor: '#FFFFFF',
                        }}
                      />
                      <span>{itemTheme.label}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          {/* Step 1-3: Intensity Slider (1~10) */}
          <div
            className="space-y-3 border-t pt-7"
            style={{ borderColor: theme.border }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <label
                htmlFor="intensity-slider"
                className="text-base font-bold"
                style={{ color: theme.textPrimary }}
              >
                3. 그 감정의 무게는 어느 정도인가요?
              </label>
              <span
                className="font-gauge text-base font-semibold"
                style={{ color: theme.accentText }}
              >
                {input.intensity} / 10
              </span>
            </div>

            <div className="pt-1">
              <input
                id="intensity-slider"
                type="range"
                min={1}
                max={10}
                step={1}
                value={input.intensity}
                onChange={(e) => onChange({ intensity: Number(e.target.value) })}
                className="gauge-slider w-full"
                style={
                  {
                    '--slider-accent': theme.accent,
                    background: `linear-gradient(to right, ${theme.accent} 0%, ${
                      theme.accent
                    } ${((input.intensity - 1) / 9) * 100}%, ${
                      theme.gaugeTrack
                    } ${((input.intensity - 1) / 9) * 100}%, ${
                      theme.gaugeTrack
                    } 100%)`,
                  } as React.CSSProperties
                }
              />
              <div
                className="mt-2 flex items-center justify-between text-xs"
                style={{ color: theme.textSecondary }}
              >
                <span className="font-gauge">1 (가벼움)</span>
                <span className="font-medium" style={{ color: theme.accentText }}>
                  {getIntensityDescriptor(input.intensity)}
                </span>
                <span className="font-gauge">10 (매우 무거움)</span>
              </div>
            </div>
          </div>

          {/* Step 1-4: Concern Input Textarea */}
          <div
            className="space-y-3 border-t pt-7"
            style={{ borderColor: theme.border }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <label
                htmlFor="concern-textarea"
                className="text-base font-bold"
                style={{ color: theme.textPrimary }}
              >
                4. 오늘 어떤 일이 있었는지 편하게 적어 주세요
              </label>
              <span
                className="font-gauge text-xs"
                style={{ color: theme.textSecondary }}
              >
                {input.concernText.length} / 1,500
              </span>
            </div>

            <div
              className="flex items-start gap-2 text-xs leading-relaxed"
              style={{ color: theme.textSecondary }}
            >
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <p>
                이름·전화번호·학교명 같은 개인정보는 적지 말아 주세요. 입력하신
                이야기는 서버에 남지 않고 브라우저 안에서만 다뤄집니다.
              </p>
            </div>

            <textarea
              id="concern-textarea"
              rows={5}
              maxLength={1500}
              value={input.concernText}
              onChange={(e) => onChange({ concernText: e.target.value })}
              placeholder="예) 친구와 사소한 말로 오해가 생겼는데 먼저 연락하기가 망설여져요. / 학생들에게 화를 내지 않고 마음을 전하고 싶은데 자꾸 지칩니다."
              aria-invalid={Boolean(validationError)}
              aria-describedby={validationError ? 'concern-error' : undefined}
              className="theme-transition w-full rounded-2xl border p-4 text-base leading-relaxed focus:outline-2 focus:outline-offset-1"
              style={{
                backgroundColor: theme.bgPage,
                borderColor: validationError ? '#DC2626' : theme.border,
                color: theme.textPrimary,
                outlineColor: theme.accent,
              }}
            />

            {validationError && (
              <p
                id="concern-error"
                role="alert"
                className="text-sm font-medium text-red-700"
              >
                {validationError}
              </p>
            )}
          </div>

          {/* Submit CTA */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs" style={{ color: theme.textSecondary }}>
              접수가 끝나면 4장의 마음 계기판 카드로 정리해 드려요.
            </p>
            <button
              type="submit"
              disabled={isLoading}
              className="theme-transition inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl px-7 py-3 text-base font-semibold text-white cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-65 disabled:cursor-wait hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: theme.accent,
                outlineColor: theme.accent,
              }}
            >
              <span>
                {isLoading ? '마음 계기판을 살피는 중...' : '계기판 점검하기'}
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
