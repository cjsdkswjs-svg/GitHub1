import { useEffect, useRef, useState } from 'react';
import { BookHeart, Check, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ConcernCategory,
  detectSafetySignal,
  EMOTION_KEYS,
  EMOTION_THEMES,
  EmotionKey,
  EmotionTheme,
  formatKoreanDateLabel,
  getLocalDateKey,
  MindDiaryEntry,
  SafetyAssessment,
  validateMindDiaryLine,
} from '../lib/daeriLogic';

interface MindDiaryProps {
  isOpen: boolean;
  onClose: () => void;
  entries: MindDiaryEntry[];
  currentEmotion: EmotionKey;
  currentCategory: ConcernCategory;
  theme: EmotionTheme;
  onSaveEntry: (draft: {
    dateKey: string;
    emotion: EmotionKey;
    oneLine: string;
    category?: ConcernCategory;
  }) => void;
  onDeleteEntry: (dateKey: string) => void;
  onSafetyTrigger: (assessment: SafetyAssessment) => void;
}

export function MindDiary({
  isOpen,
  onClose,
  entries,
  currentEmotion,
  currentCategory,
  theme,
  onSaveEntry,
  onDeleteEntry,
  onSafetyTrigger,
}: MindDiaryProps) {
  const todayKey = getLocalDateKey();
  const todayEntry = entries.find((item) => item.dateKey === todayKey);

  const [selectedEmotion, setSelectedEmotion] = useState<EmotionKey>(
    todayEntry?.emotion ?? currentEmotion,
  );
  const [oneLine, setOneLine] = useState(todayEntry?.oneLine ?? '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const wasOpenRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      const latestToday = entries.find((item) => item.dateKey === todayKey);
      setSelectedEmotion(latestToday?.emotion ?? currentEmotion);
      setOneLine(latestToday?.oneLine ?? '');
      setErrorMsg(null);
      setSavedToast(false);

      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
      wasOpenRef.current = true;
      return () => window.clearTimeout(timer);
    }
    if (!isOpen) {
      wasOpenRef.current = false;
    }
  }, [isOpen, todayKey, entries, currentEmotion]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateMindDiaryLine(oneLine);
    if (!validation.valid) {
      setErrorMsg(validation.error ?? '오늘의 마음을 한 줄로 적어 주세요.');
      setSavedToast(false);
      return;
    }

    const safety = detectSafetySignal(oneLine);
    if (safety.level !== 'safe') {
      onClose();
      onSafetyTrigger(safety);
      return;
    }

    onSaveEntry({
      dateKey: todayKey,
      emotion: selectedEmotion,
      oneLine: oneLine.trim(),
      category: currentCategory,
    });
    setErrorMsg(null);
    setSavedToast(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="presentation"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {/* Slide-over Sidebar Drawer */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="mind-diary-title"
            initial={{ x: prefersReducedMotion ? 0 : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: prefersReducedMotion ? 0 : '100%' }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex h-full w-full max-w-md flex-col border-l bg-white shadow-xl"
            style={{ borderColor: theme.border }}
          >
            {/* Header */}
            <div
              className="flex items-start justify-between gap-3 border-b px-5 py-4 sm:px-6"
              style={{ borderColor: theme.border }}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: theme.accentSoft,
                    color: theme.accentText,
                  }}
                  aria-hidden="true"
                >
                  <BookHeart className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-xs font-medium"
                    style={{ color: theme.textSecondary }}
                  >
                    브라우저에만 남기는 마음 여정
                  </p>
                  <h2
                    id="mind-diary-title"
                    className="font-diary text-xl font-bold leading-snug"
                    style={{ color: theme.textPrimary }}
                  >
                    오늘의 마음 일기
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="마음 일기 닫기"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border cursor-pointer hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 shrink-0"
                style={{
                  borderColor: theme.border,
                  color: theme.textPrimary,
                  outlineColor: theme.accent,
                }}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 space-y-6">
              {/* Today's One-Line Reflection Editor */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span
                    className="text-sm font-bold"
                    style={{ color: theme.textPrimary }}
                  >
                    오늘 · {formatKoreanDateLabel(todayKey)}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: theme.textSecondary }}
                  >
                    {todayEntry ? '기록 있음 · 언제든 수정 가능' : '오늘의 첫 한 줄'}
                  </span>
                </div>

                {/* Emotion Selector */}
                <div className="space-y-2">
                  <span
                    className="text-xs font-semibold block"
                    style={{ color: theme.textSecondary }}
                  >
                    오늘의 마음 날씨
                  </span>
                  <div
                    role="group"
                    aria-label="오늘의 마음 날씨 선택"
                    className="grid grid-cols-5 gap-1.5"
                  >
                    {EMOTION_KEYS.map((key) => {
                      const active = selectedEmotion === key;
                      const eTheme = EMOTION_THEMES[key];
                      return (
                        <button
                          key={key}
                          type="button"
                          aria-pressed={active}
                          onClick={() => {
                            setSelectedEmotion(key);
                            setSavedToast(false);
                          }}
                          className="theme-transition min-h-[40px] rounded-xl border px-1 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1"
                          style={{
                            backgroundColor: active ? eTheme.accentSoft : '#FFFFFF',
                            borderColor: active ? eTheme.accent : theme.border,
                            color: active ? eTheme.accentText : theme.textSecondary,
                            outlineColor: eTheme.accent,
                          }}
                        >
                          {key}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* One-Line Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="mind-diary-input"
                      className="text-xs font-semibold"
                      style={{ color: theme.textPrimary }}
                    >
                      오늘의 마음 한 줄
                    </label>
                    <span
                      className="font-gauge text-xs"
                      style={{ color: theme.textSecondary }}
                    >
                      {oneLine.length} / 140
                    </span>
                  </div>

                  <textarea
                    ref={inputRef}
                    id="mind-diary-input"
                    rows={2}
                    maxLength={140}
                    value={oneLine}
                    onChange={(e) => {
                      setOneLine(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                      if (savedToast) setSavedToast(false);
                    }}
                    placeholder="예) 먼저 말을 꺼내기까지 망설였지만, 내 마음을 적어 보니 조금 차분해졌어요."
                    aria-invalid={Boolean(errorMsg)}
                    className="theme-transition w-full resize-none rounded-2xl border px-3.5 py-2.5 text-sm leading-relaxed focus:outline-2 focus:outline-offset-1"
                    style={{
                      backgroundColor: theme.bgPage,
                      borderColor: errorMsg ? '#DC2626' : theme.border,
                      color: theme.textPrimary,
                      outlineColor: theme.accent,
                    }}
                  />

                  {errorMsg && (
                    <p role="alert" className="text-xs font-medium text-red-700">
                      {errorMsg}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="submit"
                    className="theme-transition inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      backgroundColor: theme.accent,
                      outlineColor: theme.accent,
                    }}
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                    <span>{todayEntry ? '오늘 한 줄 수정하기' : '오늘 한 줄 저장하기'}</span>
                  </button>

                  {savedToast && (
                    <span
                      role="status"
                      className="text-xs font-semibold"
                      style={{ color: theme.accentText }}
                    >
                      저장되었어요
                    </span>
                  )}
                </div>
              </form>

              {/* Emotional Journey History */}
              <section
                aria-label="지난 마음 여정 목록"
                className="border-t pt-5 space-y-4"
                style={{ borderColor: theme.border }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3
                    className="text-sm font-bold"
                    style={{ color: theme.textPrimary }}
                  >
                    지난 마음 여정
                  </h3>
                  <span
                    className="font-gauge text-xs"
                    style={{ color: theme.textSecondary }}
                  >
                    총 {entries.length}일 기록
                  </span>
                </div>

                {entries.length === 0 ? (
                  <p
                    className="text-sm leading-relaxed py-2"
                    style={{ color: theme.textSecondary }}
                  >
                    아직 남겨진 마음 한 줄이 없어요. 오늘 느낀 감정을 한 줄로 남기면 나만의 주행 여정이 이곳에 차곡차곡 쌓입니다.
                  </p>
                ) : (
                  <ul className="divide-y" style={{ borderColor: theme.border }}>
                    {entries.map((entry) => {
                      const isToday = entry.dateKey === todayKey;
                      const entryTheme = EMOTION_THEMES[entry.emotion] ?? theme;
                      return (
                        <li
                          key={entry.id}
                          className="py-3.5 first:pt-1 last:pb-1 space-y-1.5"
                          style={{ borderColor: theme.border }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div
                              className="flex flex-wrap items-center gap-1.5 text-xs font-medium"
                              style={{ color: theme.textSecondary }}
                            >
                              <span
                                className="font-semibold"
                                style={{ color: isToday ? theme.accentText : theme.textPrimary }}
                              >
                                {isToday ? '오늘' : formatKoreanDateLabel(entry.dateKey)}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span style={{ color: entryTheme.accentText }}>
                                {entry.emotion}
                              </span>
                              {entry.category && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{entry.category}</span>
                                </>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => onDeleteEntry(entry.dateKey)}
                              aria-label={`${formatKoreanDateLabel(entry.dateKey)} 마음 일기 삭제`}
                              className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>

                          <p
                            className="text-sm leading-relaxed"
                            style={{ color: theme.textPrimary }}
                          >
                            {entry.oneLine}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>

            {/* Footer */}
            <div
              className="border-t px-5 py-3.5 sm:px-6 text-xs leading-relaxed"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.bgPage,
                color: theme.textSecondary,
              }}
            >
              이름이나 연락처는 적지 말아 주세요. 모든 마음 일기는 서버가 아닌 이 브라우저(localStorage)에만 저장됩니다.
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
