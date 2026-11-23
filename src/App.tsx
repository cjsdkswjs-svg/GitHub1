import { useCallback, useEffect, useRef, useState } from 'react';
import { BookHeart } from 'lucide-react';
import { ArrivalScreen } from './components/ArrivalScreen';
import { BoardingScreen } from './components/BoardingScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { DrivingScreen } from './components/DrivingScreen';
import { MindDiary } from './components/MindDiary';
import { RouteHeader } from './components/RouteHeader';
import { SafetyNoticeCard } from './components/SafetyNoticeCard';
import {
  AnalystResult,
  BoardingInput,
  ChatMessage,
  ConcernCategory,
  createInitialDriverGreeting,
  detectSafetySignal,
  DriveLogSummary,
  DrivingMode,
  EmotionKey,
  FontScale,
  formatTimeLabel,
  getEmotionTheme,
  loadMindDiaryEntries,
  MindDiaryEntry,
  parseAnalystResult,
  parseDriveLogSummary,
  removeMindDiaryEntry,
  SafetyAssessment,
  SampleConcern,
  saveMindDiaryEntries,
  shouldAutoSummarizeDrive,
  upsertMindDiaryEntry,
  validateBoardingInput,
  validateChatMessage,
} from './lib/daeriLogic';

const INITIAL_INPUT: BoardingInput = {
  category: '친구 관계',
  emotion: '서운함',
  intensity: 5,
  concernText: '',
};

const FONT_SCALE_PX: Record<FontScale, string> = {
  normal: '16px',
  large: '18px',
  xlarge: '20px',
};

export default function App() {
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const [fontScale, setFontScale] = useState<FontScale>('normal');
  const [input, setInput] = useState<BoardingInput>(INITIAL_INPUT);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [safetyBlock, setSafetyBlock] = useState<SafetyAssessment | null>(null);

  const [analysis, setAnalysis] = useState<AnalystResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // Stage 3 Driving State
  const [drivingMode, setDrivingMode] = useState<DrivingMode>('listen');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isReplying, setIsReplying] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [lastPendingText, setLastPendingText] = useState<string | null>(null);
  const [hasArrived, setHasArrived] = useState(false);

  // Stage 3 Driving Log Summary Sidebar State
  const [driveSummary, setDriveSummary] = useState<DriveLogSummary | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [lastSummarizedCount, setLastSummarizedCount] = useState(0);
  const rideSessionRef = useRef(0);

  // MindDiary localStorage State
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<MindDiaryEntry[]>(() =>
    loadMindDiaryEntries(),
  );

  const theme = getEmotionTheme(input.emotion);

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SCALE_PX[fontScale];
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [fontScale]);

  const handleInputChange = (patch: Partial<BoardingInput>) => {
    setInput((prev) => ({ ...prev, ...patch }));
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleSelectSample = (sample: SampleConcern) => {
    setInput({
      category: sample.category,
      emotion: sample.emotion,
      intensity: sample.intensity,
      concernText: sample.concernText,
    });
    setValidationError(null);
    setSafetyBlock(null);
  };

  const runAnalysis = async (currentInput: BoardingInput) => {
    setValidationError(null);
    setAnalyzeError(null);

    const validation = validateBoardingInput(currentInput);
    if (!validation.valid) {
      setValidationError(validation.error ?? '입력 내용을 다시 확인해 주세요.');
      return;
    }

    const clientSafety = detectSafetySignal(currentInput.concernText);
    if (clientSafety.level !== 'safe') {
      setSafetyBlock(clientSafety);
      setStage(1);
      return;
    }

    rideSessionRef.current += 1;
    setSafetyBlock(null);
    setStage(2);
    setIsAnalyzing(true);
    setMessages([]);
    setHasArrived(false);
    setReplyError(null);
    setDriveSummary(null);
    setIsSummarizing(false);
    setSummaryError(null);
    setLastSummarizedCount(0);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentInput),
      });

      const payload = (await response.json()) as {
        status?: string;
        safetyLevel?: 'crisis' | 'harassment';
        analysis?: unknown;
        error?: string;
      };

      if (payload.status === 'safety_blocked' && payload.safetyLevel) {
        const level = payload.safetyLevel;
        setSafetyBlock({
          level,
          title:
            level === 'crisis'
              ? '잠시 운행을 멈추고 안전한 도움을 먼저 연결할게요'
              : '상대에게 상처를 주는 문장은 대신 만들어 드릴 수 없어요',
          guidance:
            level === 'crisis'
              ? '지금 혼자 감당하기 어려운 위기 신호가 느껴져 대화를 잠시 멈추었습니다. 대리기사는 전문 상담사나 의료인이 아니므로, 믿을 수 있는 사람이나 아래 상담 기관에 도움을 요청해 주세요.'
              : '대리기사는 욕설이나 협박, 괴롭힘 목적의 표현은 작성하지 않습니다. 대신 지금 내 마음을 안전하게 정리하는 방향으로는 함께 이야기할 수 있어요.',
        });
        setStage(1);
        return;
      }

      if (!response.ok) {
        throw new Error(
          payload.error || '계기판 분석 요청을 처리하지 못했습니다. 다시 시도해 주세요.',
        );
      }

      const rawString =
        typeof payload.analysis === 'string'
          ? payload.analysis
          : JSON.stringify(payload.analysis);
      const parsed = parseAnalystResult(rawString);
      setAnalysis(parsed);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : '계기판 점검 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      setAnalyzeError(message);
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartDriving = () => {
    if (messages.length === 0) {
      setMessages([createInitialDriverGreeting(input, analysis, drivingMode)]);
    }
    setReplyError(null);
    setStage(3);
  };

  const dispatchDriveReply = async (
    userText: string,
    historyForServer: ChatMessage[],
    activeMode: DrivingMode,
  ) => {
    setIsReplying(true);
    setReplyError(null);
    setLastPendingText(userText);

    try {
      const response = await fetch('/api/drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          analysis,
          mode: activeMode,
          messages: historyForServer,
          userMessage: userText,
        }),
      });

      const payload = (await response.json()) as {
        status?: string;
        safetyLevel?: 'crisis' | 'harassment';
        reply?: string;
        error?: string;
      };

      if (payload.status === 'safety_blocked' && payload.safetyLevel) {
        const level = payload.safetyLevel;
        setSafetyBlock({
          level,
          title:
            level === 'crisis'
              ? '잠시 운행을 멈추고 안전한 도움을 먼저 연결할게요'
              : '상대에게 상처를 주는 문장은 대신 만들어 드릴 수 없어요',
          guidance:
            level === 'crisis'
              ? '대화 중 혼자 감당하기 어려운 위기 신호가 느껴져 운행을 잠시 멈추었습니다. 대리기사는 전문 상담사나 의료인이 아니므로, 믿을 수 있는 사람이나 아래 상담 기관에 도움을 요청해 주세요.'
              : '대리기사는 욕설이나 협박, 괴롭힘 목적의 표현은 작성하지 않습니다. 대신 지금 내 마음을 안전하게 정리하는 방향으로는 함께 이야기할 수 있어요.',
        });
        return;
      }

      if (!response.ok || !payload.reply) {
        throw new Error(
          payload.error || '기사님의 답변을 불러오지 못했습니다. 다시 시도해 주세요.',
        );
      }

      const driverMsg: ChatMessage = {
        id: `driver-${Date.now()}`,
        role: 'driver',
        text: payload.reply,
        mode: activeMode,
        timestampLabel: formatTimeLabel(),
      };
      setMessages((prev) => [...prev, driverMsg]);
      setLastPendingText(null);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : '응답을 받는 중 잠시 오류가 생겼습니다. 다시 보내 보시겠어요?';
      setReplyError(msg);
    } finally {
      setIsReplying(false);
    }
  };

  const handleSendMessage = (text: string) => {
    const check = validateChatMessage(text);
    if (!check.valid) return;

    const clientSafety = detectSafetySignal(text);
    if (clientSafety.level !== 'safe') {
      setSafetyBlock(clientSafety);
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      mode: drivingMode,
      timestampLabel: formatTimeLabel(),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    void dispatchDriveReply(text, messages, drivingMode);
  };

  const handleRetryLastMessage = () => {
    if (!lastPendingText || isReplying) return;
    const historyWithoutLastUser = messages.slice(0, -1);
    void dispatchDriveReply(lastPendingText, historyWithoutLastUser, drivingMode);
  };

  const requestDriveSummary = useCallback(
    async (targetMessages: ChatMessage[]) => {
      const hasUserTurn = targetMessages.some((m) => m.role === 'user');
      if (!hasUserTurn) return;

      const capturedSession = rideSessionRef.current;
      const capturedCount = targetMessages.length;

      setIsSummarizing(true);
      setSummaryError(null);

      try {
        const response = await fetch('/api/drive-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input,
            analysis,
            messages: targetMessages,
          }),
        });

        const payload = (await response.json()) as {
          status?: string;
          summary?: unknown;
          error?: string;
        };

        if (capturedSession !== rideSessionRef.current) return;

        if (!response.ok || payload.status !== 'ok') {
          throw new Error(
            payload.error || '운행 일지 요약을 정리하지 못했습니다. 다시 시도해 주세요.',
          );
        }

        const rawString =
          typeof payload.summary === 'string'
            ? payload.summary
            : JSON.stringify(payload.summary);
        const parsed = parseDriveLogSummary(rawString);
        setDriveSummary(parsed);
        setLastSummarizedCount(capturedCount);
      } catch (err: unknown) {
        if (capturedSession !== rideSessionRef.current) return;
        const msg =
          err instanceof Error
            ? err.message
            : '운행 일지 요약 중 잠시 오류가 발생했습니다.';
        setSummaryError(msg);
      } finally {
        if (capturedSession === rideSessionRef.current) {
          setIsSummarizing(false);
        }
      }
    },
    [input, analysis],
  );

  useEffect(() => {
    if (
      stage === 3 &&
      !isReplying &&
      !isSummarizing &&
      !summaryError &&
      shouldAutoSummarizeDrive(messages, lastSummarizedCount)
    ) {
      void requestDriveSummary(messages);
    }
  }, [
    stage,
    messages,
    isReplying,
    isSummarizing,
    summaryError,
    lastSummarizedCount,
    requestDriveSummary,
  ]);

  const handleArrive = () => {
    setHasArrived(true);
    setStage(4);
  };

  const handleStartNewRide = () => {
    rideSessionRef.current += 1;
    setInput(INITIAL_INPUT);
    setAnalysis(null);
    setAnalyzeError(null);
    setMessages([]);
    setReplyError(null);
    setLastPendingText(null);
    setHasArrived(false);
    setDriveSummary(null);
    setIsSummarizing(false);
    setSummaryError(null);
    setLastSummarizedCount(0);
    setStage(1);
  };

  const handleResetSafety = () => {
    const isCrisis = safetyBlock?.level === 'crisis';
    setSafetyBlock(null);
    if (isCrisis) {
      handleStartNewRide();
    }
  };

  const handleSaveDiaryEntry = (draft: {
    dateKey: string;
    emotion: EmotionKey;
    oneLine: string;
    category?: ConcernCategory;
  }) => {
    setDiaryEntries((prev) => {
      const next = upsertMindDiaryEntry(prev, draft);
      saveMindDiaryEntries(next);
      return next;
    });
  };

  const handleDeleteDiaryEntry = (dateKey: string) => {
    setDiaryEntries((prev) => {
      const next = removeMindDiaryEntry(prev, dateKey);
      saveMindDiaryEntries(next);
      return next;
    });
  };

  return (
    <div
      className="theme-transition min-h-screen flex flex-col"
      style={{
        backgroundColor: theme.bgPage,
        color: theme.textPrimary,
      }}
    >
      <RouteHeader
        currentStage={stage}
        canAccessStage2={Boolean(analysis) || isAnalyzing || Boolean(analyzeError)}
        canAccessStage3={Boolean(analysis) || messages.length > 0}
        canAccessStage4={hasArrived}
        isDiaryOpen={isDiaryOpen}
        onSelectStage={(target) => setStage(target)}
        onOpenDiary={() => setIsDiaryOpen((prev) => !prev)}
        fontScale={fontScale}
        onChangeFontScale={setFontScale}
        theme={theme}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 sm:px-6 sm:py-10">
        {safetyBlock ? (
          <SafetyNoticeCard
            assessment={safetyBlock}
            theme={theme}
            onReset={handleResetSafety}
          />
        ) : stage === 1 ? (
          <BoardingScreen
            input={input}
            theme={theme}
            validationError={validationError}
            isLoading={isAnalyzing}
            onChange={handleInputChange}
            onSelectSample={handleSelectSample}
            onSubmit={() => void runAnalysis(input)}
          />
        ) : stage === 2 ? (
          <DashboardScreen
            input={input}
            analysis={analysis}
            theme={theme}
            isLoading={isAnalyzing}
            errorMessage={analyzeError}
            onBackToBoarding={() => setStage(1)}
            onRetryAnalyze={() => void runAnalysis(input)}
            onStartDriving={handleStartDriving}
          />
        ) : stage === 3 ? (
          <DrivingScreen
            input={input}
            analysis={analysis}
            theme={theme}
            mode={drivingMode}
            messages={messages}
            isReplying={isReplying}
            replyError={replyError}
            driveSummary={driveSummary}
            isSummarizing={isSummarizing}
            summaryError={summaryError}
            lastSummarizedCount={lastSummarizedCount}
            onChangeMode={setDrivingMode}
            onSendMessage={handleSendMessage}
            onRetryLastMessage={handleRetryLastMessage}
            onRefreshSummary={() => void requestDriveSummary(messages)}
            onBackToDashboard={() => setStage(2)}
            onArrive={handleArrive}
          />
        ) : (
          <ArrivalScreen
            input={input}
            analysis={analysis}
            messages={messages}
            lastMode={drivingMode}
            theme={theme}
            onBackToDriving={() => setStage(3)}
            onStartNewRide={handleStartNewRide}
          />
        )}
      </main>

      <footer
        className="theme-transition border-t px-4 py-5 sm:px-6"
        style={{
          borderColor: theme.border,
          backgroundColor: 'rgba(255, 255, 255, 0.55)',
        }}
      >
        <div
          className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs"
          style={{ color: theme.textSecondary }}
        >
          <p className="font-medium leading-relaxed">
            안내: 대리기사는 의사나 전문 상담사가 아니며, 모든 내용은 브라우저 안에서만
            다뤄집니다.
          </p>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsDiaryOpen(true)}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border bg-white px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                borderColor: theme.border,
                color: theme.accentText,
                outlineColor: theme.accent,
              }}
            >
              <BookHeart className="h-3.5 w-3.5" aria-hidden="true" />
              <span>오늘의 마음 일기 ({diaryEntries.length})</span>
            </button>
            <span className="hidden md:inline">
              모두의 고민을 판단 없이 먼저 들어주는 마음 운행
            </span>
          </div>
        </div>
      </footer>

      <MindDiary
        isOpen={isDiaryOpen}
        onClose={() => setIsDiaryOpen(false)}
        entries={diaryEntries}
        currentEmotion={input.emotion}
        currentCategory={input.category}
        theme={theme}
        onSaveEntry={handleSaveDiaryEntry}
        onDeleteEntry={handleDeleteDiaryEntry}
        onSafetyTrigger={(assessment) => setSafetyBlock(assessment)}
      />
    </div>
  );
}
