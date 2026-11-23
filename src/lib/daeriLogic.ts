export type ConcernCategory =
  | '친구 관계'
  | '선생님·학교'
  | '공부·진로'
  | '가족'
  | '기타';

export type EmotionKey = '서운함' | '불안함' | '답답함' | '화남' | '지침';

export type FontScale = 'normal' | 'large' | 'xlarge';

export interface EmotionTheme {
  key: EmotionKey;
  label: string;
  toneName: string;
  driverPrompt: string;
  subPrompt: string;
  bgPage: string;
  bgSubtle: string;
  bgCard: string;
  border: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  accentText: string;
  textPrimary: string;
  textSecondary: string;
  gaugeTrack: string;
}

export interface AnalystResult {
  emotions: string[];
  intensity: number;
  core: string;
  blindspot: string;
  values: string[];
}

export type SafetyLevel = 'safe' | 'crisis' | 'harassment';

export interface SafetyAssessment {
  level: SafetyLevel;
  title: string;
  guidance: string;
}

export interface BoardingInput {
  category: ConcernCategory;
  emotion: EmotionKey;
  intensity: number;
  concernText: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const CONCERN_CATEGORIES: ConcernCategory[] = [
  '친구 관계',
  '선생님·학교',
  '공부·진로',
  '가족',
  '기타',
];

export const EMOTION_KEYS: EmotionKey[] = [
  '서운함',
  '불안함',
  '답답함',
  '화남',
  '지침',
];

export const EMOTION_THEMES: Record<EmotionKey, EmotionTheme> = {
  서운함: {
    key: '서운함',
    label: '서운함',
    toneName: '차분한 푸른 톤',
    driverPrompt: '기대했던 마음이 빗나갔을 때 차가운 바람이 들어오죠.',
    subPrompt: '천천히 말씀해 보세요. 그 서운함의 결부터 함께 살펴볼게요.',
    bgPage: '#F0F5FA',
    bgSubtle: '#E4EEF7',
    bgCard: '#FFFFFF',
    border: '#CBDCEB',
    accent: '#2B5B84',
    accentHover: '#224869',
    accentSoft: '#DCE8F4',
    accentText: '#1F4463',
    textPrimary: '#162433',
    textSecondary: '#43566B',
    gaugeTrack: '#DCE8F4',
  },
  불안함: {
    key: '불안함',
    label: '불안함',
    toneName: '고요한 연보라 톤',
    driverPrompt: '앞길이 안개 낀 밤길 같을 때는 속도를 줄여도 괜찮습니다.',
    subPrompt: '지금 마음속에 맴도는 걱정을 있는 그대로 꺼내 놓아 보세요.',
    bgPage: '#F4F1FA',
    bgSubtle: '#EAE4F6',
    bgCard: '#FFFFFF',
    border: '#D5CCE8',
    accent: '#5B458B',
    accentHover: '#483570',
    accentSoft: '#E5DDF5',
    accentText: '#43316B',
    textPrimary: '#1F1830',
    textSecondary: '#4E4466',
    gaugeTrack: '#E5DDF5',
  },
  답답함: {
    key: '답답함',
    label: '답답함',
    toneName: '맑은 회청색 톤',
    driverPrompt: '창문을 열지 못한 채 오래 달린 것처럼 공기가 무거우시군요.',
    subPrompt: '어디서부터 막힌 느낌이 들었는지 편한 말로 적어 주세요.',
    bgPage: '#EEF3F5',
    bgSubtle: '#E0E9ED',
    bgCard: '#FFFFFF',
    border: '#C8D6DD',
    accent: '#345B6C',
    accentHover: '#274654',
    accentSoft: '#D9E6EC',
    accentText: '#264452',
    textPrimary: '#17262D',
    textSecondary: '#435761',
    gaugeTrack: '#D9E6EC',
  },
  화남: {
    key: '화남',
    label: '화남',
    toneName: '부드러운 살구 톤',
    driverPrompt: '열이 올랐을 때는 잠시 비상등을 켜고 엔진을 식히는 시간이 필요해요.',
    subPrompt: '무엇이 마음을 건드렸는지 판단 없이 먼저 들어 드릴게요.',
    bgPage: '#FBF3EE',
    bgSubtle: '#F6E5DA',
    bgCard: '#FFFFFF',
    border: '#E8CCBA',
    accent: '#9E4F2F',
    accentHover: '#803F25',
    accentSoft: '#F5DDD0',
    accentText: '#7D3C22',
    textPrimary: '#2D1B14',
    textSecondary: '#614539',
    gaugeTrack: '#F5DDD0',
  },
  지침: {
    key: '지침',
    label: '지침',
    toneName: '따뜻한 베이지 톤',
    driverPrompt: '오늘 하루 정말 멀리까지 운전해 오셨네요. 이제 잠깐 조수석에 앉으세요.',
    subPrompt: '길게 쓰지 않으셔도 좋아요. 지금 가장 무거운 짐 하나만 내려놓아 보세요.',
    bgPage: '#F7F4ED',
    bgSubtle: '#EFEAE0',
    bgCard: '#FFFFFF',
    border: '#DDD5C5',
    accent: '#6B583E',
    accentHover: '#544530',
    accentSoft: '#EAE2D2',
    accentText: '#4F402C',
    textPrimary: '#262018',
    textSecondary: '#574D3F',
    gaugeTrack: '#EAE2D2',
  },
};

export interface RouteStage {
  id: 1 | 2 | 3 | 4 | 5;
  label: string;
  subtitle: string;
  implemented: boolean;
}

export const ROUTE_STAGES: RouteStage[] = [
  { id: 1, label: '탑승', subtitle: '고민 접수', implemented: true },
  { id: 2, label: '계기판', subtitle: '마음 분석', implemented: true },
  { id: 3, label: '운행', subtitle: '대화·토론', implemented: true },
  { id: 4, label: '도착 리포트', subtitle: '정리·대신 말하기', implemented: true },
  { id: 5, label: '주행 기록', subtitle: '마음 일기', implemented: true },
];

export type DrivingMode = 'listen' | 'organize' | 'perspective';

export interface DrivingModeOption {
  key: DrivingMode;
  label: string;
  subtitle: string;
  description: string;
}

export const DRIVING_MODES: DrivingModeOption[] = [
  {
    key: 'listen',
    label: '들어주기',
    subtitle: '공감만',
    description: '판단이나 조언 없이 지금 느끼는 마음을 먼저 그대로 들어드려요.',
  },
  {
    key: 'organize',
    label: '같이 정리하기',
    subtitle: '질문',
    description: '뒤엉킨 생각의 실타래가 풀리도록 차분한 질문을 건네드려요.',
  },
  {
    key: 'perspective',
    label: '다른 시각 모드',
    subtitle: '반대 입장 토론',
    description: '상처 주지 않는 정중한 어조로 다른 쪽의 입장도 함께 비춰 봐요.',
  },
];

export interface ChatMessage {
  id: string;
  role: 'driver' | 'user';
  text: string;
  mode: DrivingMode;
  timestampLabel: string;
}

export function getDrivingModeOption(mode: DrivingMode): DrivingModeOption {
  return DRIVING_MODES.find((item) => item.key === mode) ?? DRIVING_MODES[0];
}

export function formatTimeLabel(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function createInitialDriverGreeting(
  input: BoardingInput,
  analysis: AnalystResult | null,
  mode: DrivingMode,
): ChatMessage {
  const corePhrase = analysis?.core
    ? `“${analysis.core}”라는 마음이 참 무겁게 느껴졌을 것 같아요.`
    : `${input.emotion}이(가) 찾아온 오늘, 마음을 꺼내 주셔서 고맙습니다.`;

  let followUp = '지금 가장 먼저 털어놓고 싶은 장면부터 편하게 들려주시겠어요?';
  if (mode === 'organize') {
    followUp = '지금 상황 속에서 가장 먼저 풀어보고 싶은 매듭은 어느 부분인가요?';
  } else if (mode === 'perspective') {
    followUp = '조금 다른 각도에서도 함께 살펴보기 전에, 먼저 가장 억울하거나 걸렸던 지점부터 말씀해 주세요.';
  }

  return {
    id: 'driver-greeting-0',
    role: 'driver',
    text: `${corePhrase} ${followUp}`,
    mode,
    timestampLabel: formatTimeLabel(),
  };
}

export function validateChatMessage(text: string): ValidationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: '전하고 싶은 말을 한 줄이라도 적어 주세요.',
    };
  }
  if (trimmed.length > 800) {
    return {
      valid: false,
      error: '한 번의 대화는 800자 이내로 나누어 보내시면 더 깊이 이야기할 수 있어요.',
    };
  }
  return { valid: true };
}

export interface DriveLogSummary {
  currentTopic: string;
  keyPoints: string[];
  recentFlow: string;
  nextFocus: string;
}

export interface DriveLocalHighlights {
  userTurnCount: number;
  totalMessages: number;
  usedModeLabels: string[];
  destination: string;
  recentUserNotes: string[];
}

export function buildLocalDriveHighlights(
  input: BoardingInput,
  analysis: AnalystResult | null,
  messages: ChatMessage[],
): DriveLocalHighlights {
  const userMessages = messages.filter((m) => m.role === 'user');
  const seenModes = new Set<DrivingMode>();
  const usedModeLabels: string[] = [];

  for (const msg of messages) {
    if (!seenModes.has(msg.mode)) {
      seenModes.add(msg.mode);
      usedModeLabels.push(getDrivingModeOption(msg.mode).label);
    }
  }

  const rawDestination = (analysis?.core || input.concernText).trim();
  const destination =
    rawDestination.length > 84 ? `${rawDestination.slice(0, 81).trim()}...` : rawDestination;

  const recentUserNotes = userMessages.slice(-3).map((msg) => {
    const clean = msg.text.replace(/\s+/g, ' ').trim();
    return clean.length > 72 ? `${clean.slice(0, 69).trim()}...` : clean;
  });

  return {
    userTurnCount: userMessages.length,
    totalMessages: messages.length,
    usedModeLabels,
    destination,
    recentUserNotes,
  };
}

export function shouldAutoSummarizeDrive(
  messages: ChatMessage[],
  lastSummarizedCount: number,
): boolean {
  const userTurnCount = messages.filter((m) => m.role === 'user').length;
  if (userTurnCount < 2) return false;
  const lastMsg = messages[messages.length - 1];
  if (!lastMsg || lastMsg.role !== 'driver') return false;
  if (lastSummarizedCount === 0) return true;
  return messages.length - lastSummarizedCount >= 4;
}

export function parseDriveLogSummary(rawText: string): DriveLogSummary {
  const cleaned = extractJsonString(rawText);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('운행 일지 요약을 읽는 중 형식이 어긋났어요. 다시 요약해 볼까요?');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('운행 일지 요약 데이터 구조가 올바르지 않습니다.');
  }

  const record = parsed as Record<string, unknown>;
  const currentTopic =
    typeof record.currentTopic === 'string' ? record.currentTopic.trim() : '';
  const recentFlow =
    typeof record.recentFlow === 'string' ? record.recentFlow.trim() : '';
  const nextFocus =
    typeof record.nextFocus === 'string' ? record.nextFocus.trim() : '';

  const keyPoints = Array.isArray(record.keyPoints)
    ? record.keyPoints
        .filter((item): item is string => typeof item === 'string')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 4)
    : [];

  if (!currentTopic || !recentFlow || keyPoints.length === 0) {
    throw new Error('운행 일지 요약의 핵심 항목이 비어 있습니다.');
  }

  return {
    currentTopic,
    keyPoints,
    recentFlow,
    nextFocus: nextFocus || '지금 떠오르는 감정이나 장면을 조금 더 들려주세요.',
  };
}

export interface SampleConcern {
  id: string;
  roleLabel: string;
  title: string;
  category: ConcernCategory;
  emotion: EmotionKey;
  intensity: number;
  concernText: string;
}

export const SAMPLE_CONCERNS: SampleConcern[] = [
  {
    id: 'student-friend',
    roleLabel: '학생 예시',
    title: '단톡방 오해와 서운함',
    category: '친구 관계',
    emotion: '서운함',
    intensity: 7,
    concernText:
      '모둠 과제를 같이 하기로 했는데 친한 친구가 제 의견만 계속 넘기고 다른 친구들 말만 들어줘서 서운해요. 따지자니 사이가 어색해질 것 같고, 참자니 자꾸 마음이 상합니다.',
  },
  {
    id: 'teacher-class',
    roleLabel: '선생님 예시',
    title: '학급 지도와 지친 마음',
    category: '선생님·학교',
    emotion: '지침',
    intensity: 8,
    concernText:
      '요즘 반에서 사소한 다툼이 잦아서 수업 시간 외에 중재하느라 진이 빠집니다. 아이들을 따뜻하게 대하고 싶은데 자꾸 엄하게만 말하게 되는 제 모습에 스스로도 마음이 무겁습니다.',
  },
  {
    id: 'student-study',
    roleLabel: '학생 예시',
    title: '진로 선택의 불안감',
    category: '공부·진로',
    emotion: '불안함',
    intensity: 6,
    concernText:
      '주변 친구들은 다 목표가 뚜렷해 보이는데 저만 아직 무엇을 좋아하는지 모르겠어요. 시험 성적도 생각만큼 나오지 않아 이대로 뒤처지는 건 아닌지 밤마다 걱정이 커집니다.',
  },
];

export function getEmotionTheme(emotion: EmotionKey): EmotionTheme {
  return EMOTION_THEMES[emotion] ?? EMOTION_THEMES['서운함'];
}

export function validateBoardingInput(input: BoardingInput): ValidationResult {
  const trimmed = input.concernText.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: '고민 내용을 한 줄이라도 들려주시면 계기판을 점검해 드릴게요.',
    };
  }
  if (trimmed.length < 4) {
    return {
      valid: false,
      error: '조금만 더 상황을 들려주시면 마음 계기판을 정확히 읽을 수 있어요. (4자 이상)',
    };
  }
  if (trimmed.length > 1500) {
    return {
      valid: false,
      error: '고민 내용은 1,500자 이내로 담아 주시면 좋아요.',
    };
  }
  if (
    !Number.isFinite(input.intensity) ||
    input.intensity < 1 ||
    input.intensity > 10
  ) {
    return {
      valid: false,
      error: '감정 강도는 1부터 10 사이에서 선택해 주세요.',
    };
  }
  return { valid: true };
}

const CRISIS_PATTERNS: RegExp[] = [
  /자살/,
  /자해/,
  /죽고\s*싶/,
  /살기\s*싫/,
  /살고\s*싶지\s*않/,
  /극단적\s*선택/,
  /목숨을?\s*끊/,
  /세상을?\s*떠나고\s*싶/,
  /사라지고\s*싶/,
  /뛰어내리/,
  /유서/,
  /손목을?\s*긋/,
];

const HARASSMENT_PATTERNS: RegExp[] = [
  /협박\s*(문자|메시지|글|해줘|써줘)/,
  /욕설\s*(써줘|만들어|해줘|대신)/,
  /괴롭히(는|려고|고\s*싶)/,
  /신상\s*(털|공개|유포)/,
  /왕따\s*(시키|만들)/,
  /저주\s*(하는|글|써줘)/,
  /죽여\s*버리/,
  /패고\s*싶/,
  /보복\s*(하|글|방법)/,
];

export function detectSafetySignal(text: string): SafetyAssessment {
  const normalized = text.trim();
  if (!normalized) {
    return { level: 'safe', title: '', guidance: '' };
  }

  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        level: 'crisis',
        title: '잠시 운행을 멈추고 안전한 도움을 먼저 연결할게요',
        guidance:
          '지금 혼자 감당하기 어려운 위기 신호가 느껴져 대화를 잠시 멈추었습니다. 대리기사는 전문 상담사나 의료인이 아니므로, 지금 바로 믿을 수 있는 가족·선생님이나 아래 전문 상담 기관에 도움을 요청해 주세요.',
      };
    }
  }

  for (const pattern of HARASSMENT_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        level: 'harassment',
        title: '상대에게 상처를 주는 문장은 대신 만들어 드릴 수 없어요',
        guidance:
          '대리기사는 욕설이나 협박, 괴롭힘 목적의 표현은 작성하지 않습니다. 대신 지금 왜 그렇게 화가 나고 억울한지, 내 마음을 안전하게 정리하는 방향으로는 함께 이야기할 수 있어요.',
      };
    }
  }

  return { level: 'safe', title: '', guidance: '' };
}

export function extractJsonString(raw: string): string {
  const trimmed = raw.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

export function parseAnalystResult(rawText: string): AnalystResult {
  const cleaned = extractJsonString(rawText);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('분석 결과를 읽는 중에 형식이 어긋났어요. 다시 한 번 점검해 볼까요?');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('분석 데이터 구조가 올바르지 않습니다.');
  }

  const record = parsed as Record<string, unknown>;

  const rawEmotions = Array.isArray(record.emotions)
    ? record.emotions
        .filter((item): item is string => typeof item === 'string')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  if (rawEmotions.length === 0) {
    throw new Error('감정 단어를 읽어오지 못했습니다.');
  }
  const emotions = rawEmotions.slice(0, 3);

  const rawIntensity = Number(record.intensity);
  if (!Number.isFinite(rawIntensity)) {
    throw new Error('감정 강도 수치를 읽어오지 못했습니다.');
  }
  const intensity = Math.min(10, Math.max(1, Math.round(rawIntensity)));

  const core = typeof record.core === 'string' ? record.core.trim() : '';
  const blindspot =
    typeof record.blindspot === 'string' ? record.blindspot.trim() : '';

  if (!core || !blindspot) {
    throw new Error('핵심 고민이나 경고등 안내가 비어 있습니다.');
  }

  const values = Array.isArray(record.values)
    ? record.values
        .filter((item): item is string => typeof item === 'string')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  if (values.length === 0) {
    throw new Error('충돌하는 가치 항목을 읽어오지 못했습니다.');
  }

  return {
    emotions,
    intensity,
    core,
    blindspot,
    values: values.slice(0, 4),
  };
}

export interface GaugeGeometry {
  clampedValue: number;
  ratio: number;
  arcLength: number;
  dashOffset: number;
  needleAngleDeg: number;
  needleTipX: number;
  needleTipY: number;
  statusLabel: string;
}

export function computeGaugeGeometry(
  intensity: number,
  radius = 86,
  centerX = 110,
  centerY = 104,
): GaugeGeometry {
  const clampedValue = Math.min(10, Math.max(1, Math.round(intensity)));
  const ratio = clampedValue / 10;
  const arcLength = Math.PI * radius;
  const dashOffset = arcLength * (1 - ratio);

  // Angle from -180 deg (left) to 0 deg (right)
  const angleRad = Math.PI * (1 - ratio);
  const needleLength = radius - 14;
  const needleTipX = Number((centerX + needleLength * Math.cos(angleRad)).toFixed(2));
  const needleTipY = Number((centerY - needleLength * Math.sin(angleRad)).toFixed(2));
  const needleAngleDeg = Number((-90 + ratio * 180).toFixed(1));

  let statusLabel = '잔잔한 주행';
  if (clampedValue >= 8) {
    statusLabel = '잠시 멈춤 권장';
  } else if (clampedValue >= 5) {
    statusLabel = '주의 깊은 살핌';
  }

  return {
    clampedValue,
    ratio,
    arcLength: Number(arcLength.toFixed(2)),
    dashOffset: Number(dashOffset.toFixed(2)),
    needleAngleDeg,
    needleTipX,
    needleTipY,
    statusLabel,
  };
}

export function getIntensityDescriptor(intensity: number): string {
  const clamped = Math.min(10, Math.max(1, Math.round(intensity)));
  if (clamped <= 3) return '잔잔하게 스치는 정도예요';
  if (clamped <= 6) return '마음 한편에 계속 걸리는 정도예요';
  if (clamped <= 8) return '꽤 무겁게 자리 잡아 숨 고르기가 필요해요';
  return '지금 당장 내려놓고 쉬어야 할 만큼 벅차요';
}

export type WarningLightId = 'master' | 'engine' | 'blindspot' | 'battery';

export interface WarningLightSpec {
  id: WarningLightId;
  shortLabel: string;
  title: string;
  severityLabel: string;
  isHighAlert: boolean;
}

export const WARNING_LIGHT_SPECS: Record<
  WarningLightId,
  Omit<WarningLightSpec, 'severityLabel' | 'isHighAlert'>
> = {
  master: {
    id: 'master',
    shortLabel: '주의',
    title: '마스터 주의 경고등',
  },
  engine: {
    id: 'engine',
    shortLabel: '엔진점검',
    title: '마음 엔진 점검등',
  },
  blindspot: {
    id: 'blindspot',
    shortLabel: '사각지대',
    title: '사각지대 감지등',
  },
  battery: {
    id: 'battery',
    shortLabel: '충전',
    title: '마음 배터리 경고등',
  },
};

export function selectWarningLight(
  blindspot: string,
  intensity: number,
  emotion: EmotionKey,
): WarningLightSpec {
  const text = blindspot.trim();
  const isHighAlert = intensity >= 8;
  const severityLabel = isHighAlert ? '우선 살핌' : '주의 살핌';

  let matchedId: WarningLightId = 'blindspot';

  if (
    emotion === '지침' ||
    /지침|지쳤|피곤|휴식|쉼|여유|에너지|부담|무리|소진|스스로를?\s*돌보/.test(text)
  ) {
    matchedId = 'battery';
  } else if (
    /말|표현|대화|소통|오해|전달|꺼내|이야기|솔직/.test(text)
  ) {
    matchedId = 'engine';
  } else if (
    isHighAlert ||
    /감정|상처|화|불안|조급|두려|억울|서운/.test(text)
  ) {
    matchedId = 'master';
  } else {
    matchedId = 'blindspot';
  }

  return {
    ...WARNING_LIGHT_SPECS[matchedId],
    severityLabel,
    isHighAlert,
  };
}

export interface MindDiaryEntry {
  id: string;
  dateKey: string;
  emotion: EmotionKey;
  oneLine: string;
  category?: ConcernCategory;
  updatedAt: string;
}

export const MIND_DIARY_STORAGE_KEY = 'daerigisa_mind_diary_v1';

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatKoreanDateLabel(dateKey: string): string {
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateKey;
  return `${match[1]}년 ${Number(match[2])}월 ${Number(match[3])}일`;
}

export function validateMindDiaryLine(text: string): ValidationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: '오늘의 마음을 담은 한 줄을 적어 주세요.',
    };
  }
  if (trimmed.length > 140) {
    return {
      valid: false,
      error: '마음 일기는 140자 이내의 한 줄로 간결하게 적어 주세요.',
    };
  }
  return { valid: true };
}

export function parseStoredMindDiary(raw: string | null): MindDiaryEntry[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const validEmotions = new Set<EmotionKey>(EMOTION_KEYS);
  const validCategories = new Set<ConcernCategory>(CONCERN_CATEGORIES);
  const entries: MindDiaryEntry[] = [];

  for (const item of parsed) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const dateKey = typeof rec.dateKey === 'string' ? rec.dateKey.trim() : '';
    const oneLine = typeof rec.oneLine === 'string' ? rec.oneLine.trim() : '';
    const emotion = rec.emotion as EmotionKey;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || !oneLine || !validEmotions.has(emotion)) {
      continue;
    }

    const category =
      typeof rec.category === 'string' && validCategories.has(rec.category as ConcernCategory)
        ? (rec.category as ConcernCategory)
        : undefined;

    entries.push({
      id: typeof rec.id === 'string' && rec.id ? rec.id : `diary-${dateKey}`,
      dateKey,
      emotion,
      oneLine: oneLine.slice(0, 140),
      category,
      updatedAt:
        typeof rec.updatedAt === 'string' && rec.updatedAt
          ? rec.updatedAt
          : new Date().toISOString(),
    });
  }

  return entries.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

export function upsertMindDiaryEntry(
  entries: MindDiaryEntry[],
  draft: {
    dateKey: string;
    emotion: EmotionKey;
    oneLine: string;
    category?: ConcernCategory;
    updatedAt?: string;
  },
): MindDiaryEntry[] {
  const cleanedLine = draft.oneLine.trim().slice(0, 140);
  const existing = entries.find((item) => item.dateKey === draft.dateKey);
  const nextEntry: MindDiaryEntry = {
    id: existing?.id ?? `diary-${draft.dateKey}`,
    dateKey: draft.dateKey,
    emotion: draft.emotion,
    oneLine: cleanedLine,
    category: draft.category,
    updatedAt: draft.updatedAt ?? new Date().toISOString(),
  };

  const filtered = entries.filter((item) => item.dateKey !== draft.dateKey);
  return [nextEntry, ...filtered].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

export function removeMindDiaryEntry(
  entries: MindDiaryEntry[],
  dateKey: string,
): MindDiaryEntry[] {
  return entries.filter((item) => item.dateKey !== dateKey);
}

export function loadMindDiaryEntries(
  storage?: Pick<Storage, 'getItem'>,
): MindDiaryEntry[] {
  try {
    const store =
      storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
    if (!store) return [];
    return parseStoredMindDiary(store.getItem(MIND_DIARY_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function saveMindDiaryEntries(
  entries: MindDiaryEntry[],
  storage?: Pick<Storage, 'setItem'>,
): void {
  try {
    const store =
      storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
    if (!store) return;
    store.setItem(MIND_DIARY_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage quota or private browsing errors gracefully
  }
}

export interface DrivingBackdropConfig {
  laneDurationSec: number;
  lampsDurationSec: number;
  horizonDurationSec: number;
  lightDurationSec: number;
  skyTop: string;
  skyBottom: string;
  horizonFill: string;
  hillFill: string;
  roadSurface: string;
  laneDashColor: string;
  lampGlowColor: string;
  ambientRibbonA: string;
  ambientRibbonB: string;
}

const MODE_PACE_MULTIPLIER: Record<DrivingMode, number> = {
  listen: 1.25, // slowest, most unhurried empathetic pace
  organize: 1.0, // steady structured cruise
  perspective: 0.85, // slightly brisker wide-vista pace
};

export function getDrivingBackdropConfig(
  emotion: EmotionKey,
  mode: DrivingMode,
): DrivingBackdropConfig {
  const theme = EMOTION_THEMES[emotion] ?? EMOTION_THEMES['서운함'];
  const factor = MODE_PACE_MULTIPLIER[mode] ?? 1.0;

  return {
    laneDurationSec: Number((3.6 * factor).toFixed(2)),
    lampsDurationSec: Number((16 * factor).toFixed(2)),
    horizonDurationSec: Number((42 * factor).toFixed(2)),
    lightDurationSec: Number((22 * factor).toFixed(2)),
    skyTop: theme.bgPage,
    skyBottom: theme.bgSubtle,
    horizonFill: theme.border,
    hillFill: theme.accentSoft,
    roadSurface: theme.textPrimary,
    laneDashColor: theme.accent,
    lampGlowColor: emotion === '화남' || emotion === '지침' ? '#F5C48D' : '#F6DEB3',
    ambientRibbonA: theme.accentSoft,
    ambientRibbonB: theme.accent,
  };
}

export function isQuotaExhaustedMessage(rawMessage: string): boolean {
  return /RESOURCE_EXHAUSTED|exceeded your current quota|quota|GenerateRequestsPerDay|"code"\s*:\s*429|\b429\b/i.test(
    rawMessage,
  );
}

export function formatGeminiUserError(
  err: unknown,
  context: 'analyze' | 'drive' | 'summary',
): { statusCode: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err ?? '');

  if (isQuotaExhaustedMessage(raw)) {
    return {
      statusCode: 429,
      message:
        '오늘 AI 응답 이용 한도가 잠시 모두 소진되어 쉬어가고 있어요. 잠시 후 다시 시도해 주세요.',
    };
  }

  if (/GEMINI_API_KEY|API_KEY_INVALID|API key not valid|PERMISSION_DENIED|\b401\b|\b403\b/i.test(raw)) {
    return {
      statusCode: 503,
      message:
        'AI 연결 설정을 확인하는 데 시간이 걸리고 있어요. 잠시 후 다시 시도해 주세요.',
    };
  }

  if (/UNAVAILABLE|DEADLINE_EXCEEDED|ETIMEDOUT|ECONNRESET|\b502\b|\b503\b|\b504\b/i.test(raw)) {
    return {
      statusCode: 503,
      message:
        '잠시 응답 도로가 혼잡해 연결이 지연되고 있어요. 잠시 후 다시 눌러 주세요.',
    };
  }

  if (context === 'analyze') {
    return {
      statusCode: 500,
      message: '계기판을 살피는 중 일시적인 오류가 생겼습니다. 다시 한 번 점검해 주세요.',
    };
  }
  if (context === 'summary') {
    return {
      statusCode: 500,
      message: '운행 일지를 정리하는 중 일시적인 오류가 생겼습니다. 다시 시도해 주세요.',
    };
  }
  return {
    statusCode: 500,
    message: '기사님의 답변을 불러오는 중 잠시 오류가 생겼습니다. 다시 보내 보시겠어요?',
  };
}

export type ApiRequestContext = 'analyze' | 'drive' | 'summary';

function getFriendlyHttpFallback(status: number, fallbackMessage: string): string {
  if (status === 429) {
    return '요청이 잠시 몰려 숨을 고르고 있어요. 잠시 후 다시 시도해 주세요.';
  }
  if (status === 404) {
    return '연결 경로를 찾지 못했어요. 페이지를 새로고침한 뒤 다시 시도해 주세요.';
  }
  if (status === 408 || status === 502 || status === 503 || status === 504 || status >= 500) {
    return '잠시 응답 도로가 혼잡해 연결이 지연되고 있어요. 잠시 후 다시 시도해 주세요.';
  }
  return fallbackMessage;
}

export function shouldRetryProxyResponse(status: number, rawText: string): boolean {
  if (status === 408 || status === 502 || status === 503 || status === 504) {
    return true;
  }
  const trimmed = rawText.trim();
  if (!trimmed) {
    return status >= 500 || status === 200;
  }
  try {
    JSON.parse(trimmed);
    return false;
  } catch {
    return true;
  }
}

export function parseSafeApiJson<T>(
  rawText: string,
  status: number,
  fallbackMessage: string,
): T {
  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new Error(getFriendlyHttpFallback(status, fallbackMessage));
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new Error(getFriendlyHttpFallback(status, fallbackMessage));
  }
}

export function formatClientNetworkError(
  err: unknown,
  context: ApiRequestContext,
): string {
  if (err instanceof Error && err.name === 'AbortError') {
    return '응답 시간이 길어져 연결을 잠시 멈췄어요. 잠시 후 다시 시도해 주세요.';
  }

  const raw = err instanceof Error ? err.message : String(err ?? '');
  const looksLikeRawTechnicalError =
    !raw.trim() ||
    !/[가-힣]/.test(raw) ||
    /unexpected token|not valid json|json\.parse|syntaxerror|failed to fetch|networkerror|load failed|err_network|aborterror|timeout/i.test(
      raw,
    );

  if (!looksLikeRawTechnicalError) {
    return raw.trim();
  }

  if (context === 'analyze') {
    return '계기판 연결 신호가 잠시 불안정해요. 다시 점검하거나 계기판 없이 바로 운행을 시작해 보세요.';
  }
  if (context === 'summary') {
    return '운행 일지 요약 연결이 잠시 지연되었어요. 잠시 후 새로고침 버튼을 눌러 주세요.';
  }
  return '기사님과의 연결 신호가 잠시 흔들렸어요. 같은 메시지를 다시 보내 보시겠어요?';
}

