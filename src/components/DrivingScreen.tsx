import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  BookOpenText,
  CarFront,
  ChevronDown,
  ChevronUp,
  Compass,
  Flag,
  Heart,
  HelpCircle,
  RefreshCw,
  Send,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  AnalystResult,
  BoardingInput,
  buildLocalDriveHighlights,
  ChatMessage,
  DRIVING_MODES,
  DriveLogSummary,
  DrivingMode,
  EmotionTheme,
  getDrivingModeOption,
} from '../lib/daeriLogic';
import { DrivingRoadBackdrop } from './DrivingRoadBackdrop';

interface DrivingScreenProps {
  input: BoardingInput;
  analysis: AnalystResult | null;
  theme: EmotionTheme;
  mode: DrivingMode;
  messages: ChatMessage[];
  isReplying: boolean;
  replyError: string | null;
  driveSummary: DriveLogSummary | null;
  isSummarizing: boolean;
  summaryError: string | null;
  lastSummarizedCount: number;
  onChangeMode: (mode: DrivingMode) => void;
  onSendMessage: (text: string) => void;
  onRetryLastMessage: () => void;
  onRefreshSummary: () => void;
  onBackToDashboard: () => void;
  onArrive: () => void;
}

const DRIVER_AVATAR_PATH = '/src/assets/images/driver_avatar_1795141566539.jpg';

const STARTER_PROMPTS = [
  '사실 그때 제일 마음 쓰였던 건 이거예요.',
  '상대 입장에서는 어떻게 느꼈을지 궁금해요.',
  '지금 가장 망설여지는 부분을 정리해 보고 싶어요.',
];

export function DrivingScreen({
  input,
  analysis,
  theme,
  mode,
  messages,
  isReplying,
  replyError,
  driveSummary,
  isSummarizing,
  summaryError,
  lastSummarizedCount,
  onChangeMode,
  onSendMessage,
  onRetryLastMessage,
  onRefreshSummary,
  onBackToDashboard,
  onArrive,
}: DrivingScreenProps) {
  const [draft, setDraft] = useState('');
  const [draftError, setDraftError] = useState<string | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [mobileLogOpen, setMobileLogOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const activeModeOption = getDrivingModeOption(mode);
  const highlights = useMemo(
    () => buildLocalDriveHighlights(input, analysis, messages),
    [input, analysis, messages],
  );
  const userTurnCount = highlights.userTurnCount;
  const hasUnsummarizedTurns =
    Boolean(driveSummary) && messages.length > lastSummarizedCount;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isReplying]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraftError('전하고 싶은 말을 한 줄이라도 적어 주세요.');
      return;
    }
    if (trimmed.length > 800) {
      setDraftError('한 번에 800자 이내로 나누어 말씀해 주세요.');
      return;
    }
    setDraftError(null);
    setDraft('');
    onSendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing &&
      e.nativeEvent.keyCode !== 229
    ) {
      e.preventDefault();
      if (!isReplying) {
        handleSubmit();
      }
    }
  };

  const renderModeIcon = (modeKey: DrivingMode) => {
    if (modeKey === 'listen') {
      return <Heart className="h-4 w-4 shrink-0" aria-hidden="true" />;
    }
    if (modeKey === 'organize') {
      return <HelpCircle className="h-4 w-4 shrink-0" aria-hidden="true" />;
    }
    return <Compass className="h-4 w-4 shrink-0" aria-hidden="true" />;
  };

  return (
    <>
      <DrivingRoadBackdrop theme={theme} mode={mode} isReplying={isReplying} />

      <div className="relative z-10 mx-auto max-w-6xl space-y-5">
        {/* Top Ride Control & Mode Selector Card */}
        <section
          className="theme-transition rounded-3xl border bg-white/90 backdrop-blur-md p-5 sm:p-6 shadow-sm space-y-5"
          style={{ borderColor: theme.border }}
        >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            {avatarFailed ? (
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: theme.accentSoft,
                  color: theme.accentText,
                }}
                aria-hidden="true"
              >
                <CarFront className="h-6 w-6" />
              </div>
            ) : (
              <img
                src={DRIVER_AVATAR_PATH}
                alt="운행 중인 베테랑 대리기사"
                referrerPolicy="no-referrer"
                onError={() => setAvatarFailed(true)}
                className="h-12 w-12 shrink-0 rounded-2xl object-cover border"
                style={{ borderColor: theme.border }}
              />
            )}

            <div className="min-w-0">
              <div
                className="flex flex-wrap items-center gap-1.5 text-xs font-medium"
                style={{ color: theme.textSecondary }}
              >
                <span>3단계 · 운행 대화</span>
                <span aria-hidden="true">·</span>
                <span>{input.category}</span>
                <span aria-hidden="true">·</span>
                <span>{input.emotion}</span>
              </div>
              <h1
                className="font-diary mt-0.5 text-xl sm:text-2xl font-bold truncate"
                style={{ color: theme.textPrimary }}
              >
                기사님과 천천히 이야기 나눠요
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                borderColor: theme.border,
                color: theme.textPrimary,
                outlineColor: theme.accent,
              }}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>계기판</span>
            </button>

            <button
              type="button"
              onClick={onArrive}
              className="theme-transition inline-flex min-h-[44px] items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: theme.accent,
                outlineColor: theme.accent,
              }}
            >
              <Flag className="h-4 w-4" aria-hidden="true" />
              <span>도착하기</span>
            </button>
          </div>
        </div>

        {/* Mode Selection Toggle */}
        <div className="border-t pt-4 space-y-2.5" style={{ borderColor: theme.border }}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span
              className="text-xs font-semibold"
              style={{ color: theme.textPrimary }}
            >
              운행 모드 선택
            </span>
            <span className="text-xs" style={{ color: theme.textSecondary }}>
              대화 중간에도 언제든 바꿀 수 있어요
            </span>
          </div>

          <div
            role="group"
            aria-label="운행 모드 선택"
            className="grid grid-cols-1 gap-2 sm:grid-cols-3"
          >
            {DRIVING_MODES.map((option) => {
              const active = mode === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChangeMode(option.key)}
                  className="theme-transition flex min-h-[44px] items-center justify-between gap-2 rounded-2xl border px-3.5 py-2 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    backgroundColor: active ? theme.accentSoft : '#FFFFFF',
                    borderColor: active ? theme.accent : theme.border,
                    color: active ? theme.accentText : theme.textPrimary,
                    outlineColor: theme.accent,
                  }}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {renderModeIcon(option.key)}
                    <span className="text-sm font-bold whitespace-nowrap">
                      {option.label}
                    </span>
                  </span>
                  <span
                    className="text-xs whitespace-nowrap shrink-0"
                    style={{
                      color: active ? theme.accentText : theme.textSecondary,
                    }}
                  >
                    {option.subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-xs leading-relaxed" style={{ color: theme.textSecondary }}>
            {activeModeOption.description}
            {analysis?.core ? ` · 핵심 목적지: ${analysis.core}` : ''}
          </p>
        </div>
      </section>

      {/* Two-Column Driving Workspace: Main Chat + Driving Log Summary Sidebar */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
        {/* Main Chat Bubble Card */}
        <section
          className="theme-transition order-2 lg:order-1 lg:col-span-8 relative rounded-3xl border bg-white/90 backdrop-blur-md shadow-sm flex flex-col overflow-hidden"
          style={{ borderColor: theme.border }}
          aria-label="기사님과의 운행 대화"
        >
          {/* Subtle Passing Windshield Light Sheen */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-20 overflow-hidden"
            style={{
              ['--drive-lamps-duration' as string]:
                mode === 'listen' ? '20s' : mode === 'perspective' ? '13.6s' : '16s',
            }}
          >
            <div
              className="driving-anim-glint h-full w-1/2 blur-xl"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${theme.accentSoft}88 50%, transparent 100%)`,
              }}
            />
          </div>

          {/* Scrollable Message Bubbles */}
          <div
            aria-live="polite"
            className="relative z-10 flex-1 space-y-4 overflow-y-auto p-5 sm:p-6 min-h-[280px] max-h-[420px]"
          >
            {messages.map((msg) => {
              const isDriver = msg.role === 'driver';
              const modeLabel = getDrivingModeOption(msg.mode).label;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex flex-col ${isDriver ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className="mb-1 flex items-center gap-1.5 px-1 text-[11px] font-medium"
                    style={{ color: theme.textSecondary }}
                  >
                    <span>{isDriver ? `기사님 · ${modeLabel}` : '나'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-gauge">{msg.timestampLabel}</span>
                  </div>

                  <div
                    className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${
                      isDriver ? 'rounded-tl-sm' : 'rounded-tr-sm text-white'
                    }`}
                    style={
                      isDriver
                        ? {
                            backgroundColor: theme.bgSubtle,
                            color: theme.textPrimary,
                          }
                        : {
                            backgroundColor: theme.accent,
                            color: '#FFFFFF',
                          }
                    }
                  >
                    {msg.text}
                  </div>
                </motion.div>
              );
            })}

            <AnimatePresence>
              {isReplying && (
                <motion.div
                  key="driver-typing-indicator"
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -4 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-start"
                  role="status"
                >
                  <span
                    className="mb-1 px-1 text-[11px] font-medium"
                    style={{ color: theme.textSecondary }}
                  >
                    답변 준비 중
                  </span>
                  <div
                    className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm flex items-center gap-2"
                    style={{
                      backgroundColor: theme.bgSubtle,
                      color: theme.textSecondary,
                    }}
                  >
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    <span>기사님이 마음을 가다듬고 답을 적고 있어요...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {replyError && (
              <div
                role="alert"
                className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <p className="min-w-0 flex-1 break-words">{replyError}</p>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {replyError.includes('새로고침') && (
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-amber-400 bg-white px-3.5 py-1.5 text-xs font-semibold text-amber-950 whitespace-nowrap shrink-0 cursor-pointer hover:bg-amber-100"
                    >
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>화면 새로고침</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onRetryLastMessage}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-amber-900 px-3.5 py-1.5 text-xs font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer hover:opacity-90"
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>다시 보내기</span>
                  </button>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Starter Prompts (before first user turn) */}
          {userTurnCount === 0 && (
            <div
              className="border-t px-5 py-3 sm:px-6 flex flex-wrap items-center gap-2"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.bgPage,
              }}
            >
              <span
                className="text-xs font-medium mr-1"
                style={{ color: theme.textSecondary }}
              >
                말문 트기:
              </span>
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    setDraft(prompt);
                    setDraftError(null);
                  }}
                  className="min-h-[36px] rounded-xl border bg-white px-3 py-1.5 text-xs font-medium cursor-pointer hover:opacity-85"
                  style={{
                    borderColor: theme.border,
                    color: theme.accentText,
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Composer Form */}
          <form
            onSubmit={handleSubmit}
            className="border-t p-4 sm:p-5 space-y-2.5 bg-white"
            style={{ borderColor: theme.border }}
          >
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor="driving-chat-input" className="sr-only">
                  기사님께 보낼 이야기
                </label>
                <textarea
                  id="driving-chat-input"
                  rows={2}
                  maxLength={800}
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    if (draftError) setDraftError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="지금 떠오르는 생각이나 감정을 편하게 말씀해 보세요..."
                  aria-invalid={Boolean(draftError)}
                  className="theme-transition w-full resize-none rounded-2xl border px-4 py-3 text-sm sm:text-base leading-relaxed focus:outline-2 focus:outline-offset-1"
                  style={{
                    backgroundColor: theme.bgPage,
                    borderColor: draftError ? '#DC2626' : theme.border,
                    color: theme.textPrimary,
                    outlineColor: theme.accent,
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isReplying}
                className="theme-transition inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-wait hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  backgroundColor: theme.accent,
                  outlineColor: theme.accent,
                }}
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                <span>보내기</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              {draftError ? (
                <span role="alert" className="font-medium text-red-700">
                  {draftError}
                </span>
              ) : (
                <span style={{ color: theme.textSecondary }}>
                  Enter로 바로 전송 · 대화가 충분해지면 상단의 “도착하기”를 눌러 주세요.
                </span>
              )}
              <span className="font-gauge" style={{ color: theme.textSecondary }}>
                {draft.length} / 800
              </span>
            </div>
          </form>
        </section>

        {/* Driving Log Summary Sidebar */}
        <aside
          aria-label="운행 일지 요약"
          className="theme-transition order-1 lg:order-2 lg:col-span-4 lg:sticky lg:top-6 rounded-3xl border bg-white/90 backdrop-blur-md shadow-sm overflow-hidden"
          style={{ borderColor: theme.border }}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: theme.accentSoft,
                  color: theme.accentText,
                }}
                aria-hidden="true"
              >
                <BookOpenText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h2
                  className="font-diary text-base font-bold truncate"
                  style={{ color: theme.textPrimary }}
                >
                  운행 일지 요약
                </h2>
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: theme.textSecondary }}
                >
                  왕복 {userTurnCount}회
                  {driveSummary ? ' · 흐름 정리됨' : ' · 실시간 기록'}
                </p>
              </div>
            </div>

            {/* Desktop Refresh Summary Button */}
            <button
              type="button"
              onClick={onRefreshSummary}
              disabled={userTurnCount === 0 || isSummarizing || isReplying}
              className="hidden lg:inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                borderColor: theme.border,
                color: theme.accentText,
                outlineColor: theme.accent,
              }}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isSummarizing ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>{isSummarizing ? '정리 중' : '요약 정리'}</span>
            </button>

            {/* Mobile Collapsible Disclosure Button */}
            <button
              type="button"
              onClick={() => setMobileLogOpen((prev) => !prev)}
              aria-expanded={mobileLogOpen}
              aria-controls="driving-log-body"
              className="lg:hidden inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                borderColor: theme.border,
                color: theme.accentText,
                outlineColor: theme.accent,
              }}
            >
              <span>{mobileLogOpen ? '접기' : '펼치기'}</span>
              {mobileLogOpen ? (
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Sidebar Body (always visible on lg+, toggleable on mobile) */}
          <div
            id="driving-log-body"
            className={`${mobileLogOpen ? 'block' : 'hidden'} lg:block border-t px-5 py-4 sm:px-5 sm:py-4 space-y-3.5`}
            style={{ borderColor: theme.border }}
          >
            {/* Route Metadata (compact when AI summary exists, with full destination before AI summary) */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p
                  className="text-xs font-semibold"
                  style={{ color: theme.textSecondary }}
                >
                  {driveSummary ? '거친 운행 모드' : '목적지 · 주행 경과'}
                </p>
                {userTurnCount >= 1 && (
                  <button
                    type="button"
                    onClick={onRefreshSummary}
                    disabled={isSummarizing || isReplying}
                    className="lg:hidden inline-flex min-h-[36px] items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-45"
                    style={{
                      borderColor: theme.border,
                      color: theme.accentText,
                    }}
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${isSummarizing ? 'animate-spin' : ''}`}
                      aria-hidden="true"
                    />
                    <span>{isSummarizing ? '정리 중' : '요약 정리'}</span>
                  </button>
                )}
              </div>

              {!driveSummary && (
                <p
                  className="text-sm font-medium leading-relaxed"
                  style={{ color: theme.textPrimary }}
                >
                  {highlights.destination}
                </p>
              )}

              <p className="text-xs font-medium" style={{ color: theme.accentText }}>
                {highlights.usedModeLabels.join(' → ')}
              </p>
            </div>

            {/* Section 2: AI Conversation Flow Summary */}
            <div
              className="border-t pt-3.5 space-y-3"
              style={{ borderColor: theme.border }}
            >
              <p
                className="text-xs font-semibold"
                style={{ color: theme.textSecondary }}
              >
                지금까지의 대화 흐름
              </p>

              {isSummarizing && !driveSummary ? (
                <div
                  role="status"
                  className="flex items-center gap-2.5 py-2 text-sm"
                  style={{ color: theme.textSecondary }}
                >
                  <RefreshCw className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
                  <span>지금까지의 이야기를 한눈에 보기 좋게 정리하고 있어요...</span>
                </div>
              ) : summaryError ? (
                <div
                  role="alert"
                  className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-950 space-y-2.5"
                >
                  <p className="leading-relaxed break-words">{summaryError}</p>
                  <button
                    type="button"
                    onClick={onRefreshSummary}
                    disabled={isSummarizing}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl bg-amber-900 px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap cursor-pointer hover:opacity-90"
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>다시 요약하기</span>
                  </button>
                </div>
              ) : driveSummary ? (
                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: theme.accentText }}
                    >
                      현재 모인 주제
                    </span>
                    <p
                      className="text-sm font-bold leading-snug"
                      style={{ color: theme.textPrimary }}
                    >
                      {driveSummary.currentTopic}
                    </p>
                  </div>

                  <p
                    className="text-xs sm:text-sm leading-relaxed"
                    style={{ color: theme.textSecondary }}
                  >
                    {driveSummary.recentFlow}
                  </p>

                  <div className="space-y-1.5">
                    <span
                      className="text-xs font-semibold block"
                      style={{ color: theme.textPrimary }}
                    >
                      핵심 요점
                    </span>
                    <ul className="space-y-1.5">
                      {driveSummary.keyPoints.map((point, index) => (
                        <li
                          key={`${index}-${point.slice(0, 12)}`}
                          className="flex items-start gap-2 text-xs sm:text-sm leading-snug"
                          style={{ color: theme.textPrimary }}
                        >
                          <span
                            className="font-gauge mt-0.5 text-[11px] font-bold shrink-0"
                            style={{ color: theme.accentText }}
                          >
                            0{index + 1}
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className="border-t pt-2.5 space-y-0.5"
                    style={{ borderColor: theme.border }}
                  >
                    <span
                      className="text-[11px] font-semibold block"
                      style={{ color: theme.accentText }}
                    >
                      이어갈 다음 방향
                    </span>
                    <p
                      className="text-xs sm:text-sm leading-relaxed"
                      style={{ color: theme.textPrimary }}
                    >
                      {driveSummary.nextFocus}
                    </p>
                  </div>

                  {hasUnsummarizedTurns && !isSummarizing && (
                    <p
                      className="text-[11px] leading-relaxed"
                      style={{ color: theme.textSecondary }}
                    >
                      새로운 대화가 이어졌어요. 상단의 “요약 정리”를 누르면 방금 나눈 말까지 반영됩니다.
                    </p>
                  )}

                  {isSummarizing && (
                    <p
                      role="status"
                      className="flex items-center gap-1.5 text-xs"
                      style={{ color: theme.accentText }}
                    >
                      <RefreshCw className="h-3 w-3 animate-spin" aria-hidden="true" />
                      <span>최신 대화로 요약을 업데이트하고 있어요...</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {highlights.recentUserNotes.length > 0 ? (
                    <ul className="space-y-2">
                      {highlights.recentUserNotes.map((note, idx) => (
                        <li
                          key={`${idx}-${note.slice(0, 10)}`}
                          className="text-sm leading-relaxed"
                          style={{ color: theme.textPrimary }}
                        >
                          <span
                            className="font-gauge mr-1.5 text-xs font-bold"
                            style={{ color: theme.accentText }}
                          >
                            {idx + 1}.
                          </span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: theme.textSecondary }}
                    >
                      첫 이야기를 건네주시면 이곳에 대화 흐름이 차곡차곡 기록됩니다.
                    </p>
                  )}

                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: theme.textSecondary }}
                  >
                    대화가 2회 이상 오가면 흐름을 놓치지 않도록 AI가 핵심 요점을 자동으로 정리해 드려요.
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
      </div>
    </>
  );
}
