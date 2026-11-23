import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLocalDriveHighlights,
  ChatMessage,
  computeGaugeGeometry,
  createInitialDriverGreeting,
  detectSafetySignal,
  DRIVING_MODES,
  formatClientNetworkError,
  formatGeminiUserError,
  formatKoreanDateLabel,
  getDrivingBackdropConfig,
  getDrivingModeOption,
  getEmotionTheme,
  isQuotaExhaustedMessage,
  loadMindDiaryEntries,
  MIND_DIARY_STORAGE_KEY,
  MindDiaryEntry,
  parseAnalystResult,
  parseDriveLogSummary,
  parseSafeApiJson,
  parseStoredMindDiary,
  removeMindDiaryEntry,
  saveMindDiaryEntries,
  selectWarningLight,
  shouldAutoSummarizeDrive,
  shouldRetryProxyResponse,
  upsertMindDiaryEntry,
  validateBoardingInput,
  validateChatMessage,
  validateMindDiaryLine,
} from './daeriLogic';

test('getEmotionTheme returns distinct theme tokens for all 5 emotions', () => {
  const emotions = ['서운함', '불안함', '답답함', '화남', '지침'] as const;
  const bgColors = new Set<string>();
  for (const emotion of emotions) {
    const theme = getEmotionTheme(emotion);
    assert.equal(theme.key, emotion);
    assert.ok(theme.driverPrompt.length > 0);
    bgColors.add(theme.bgPage);
  }
  assert.equal(bgColors.size, 5);
});

test('validateBoardingInput rejects empty or overly short concerns', () => {
  const emptyRes = validateBoardingInput({
    category: '친구 관계',
    emotion: '서운함',
    intensity: 5,
    concernText: '   ',
  });
  assert.equal(emptyRes.valid, false);
  assert.ok(emptyRes.error);

  const shortRes = validateBoardingInput({
    category: '친구 관계',
    emotion: '서운함',
    intensity: 5,
    concernText: '힘듦',
  });
  assert.equal(shortRes.valid, false);

  const briefKoreanRes = validateBoardingInput({
    category: '친구 관계',
    emotion: '서운함',
    intensity: 5,
    concernText: '친구가 서운해요',
  });
  assert.equal(briefKoreanRes.valid, true);

  const validRes = validateBoardingInput({
    category: '공부·진로',
    emotion: '불안함',
    intensity: 7,
    concernText: '시험이 다가오는데 집중이 전혀 되지 않아 불안합니다.',
  });
  assert.equal(validRes.valid, true);
});

test('detectSafetySignal catches crisis and harassment signals accurately', () => {
  const crisis = detectSafetySignal('요즘 너무 힘들어서 죽고 싶다는 생각이 들어요.');
  assert.equal(crisis.level, 'crisis');

  const harassment = detectSafetySignal('친구에게 보낼 협박 문자 좀 대신 써줘요.');
  assert.equal(harassment.level, 'harassment');

  const safe = detectSafetySignal('선생님께 진로 상담을 요청드리고 싶은데 말을 꺼내기 어렵습니다.');
  assert.equal(safe.level, 'safe');
});

test('parseAnalystResult parses valid JSON and fenced JSON and clamps intensity', () => {
  const raw = `\`\`\`json
  {
    "emotions": ["서운함", "어색함", "조심스러움"],
    "intensity": 12,
    "core": "친한 친구에게 의견을 존중받지 못해 마음이 다쳤습니다.",
    "blindspot": "상대도 과제 마감 압박 때문에 여유가 없었을 가능성을 살펴볼 수 있어요.",
    "values": ["솔직한 표현", "관계의 평화"]
  }
  \`\`\``;

  const parsed = parseAnalystResult(raw);
  assert.deepEqual(parsed.emotions, ['서운함', '어색함', '조심스러움']);
  assert.equal(parsed.intensity, 10);
  assert.equal(parsed.values.length, 2);
});

test('parseAnalystResult throws descriptive errors on invalid JSON or missing fields', () => {
  assert.throws(() => parseAnalystResult('not json at all'));
  assert.throws(() =>
    parseAnalystResult(JSON.stringify({ emotions: [], intensity: 5, core: '', blindspot: '', values: [] })),
  );
});

test('computeGaugeGeometry produces valid semicircular coordinates and labels', () => {
  const minGauge = computeGaugeGeometry(1);
  assert.equal(minGauge.clampedValue, 1);
  assert.equal(minGauge.statusLabel, '잔잔한 주행');
  assert.ok(minGauge.needleTipX < 110);

  const maxGauge = computeGaugeGeometry(10);
  assert.equal(maxGauge.clampedValue, 10);
  assert.equal(maxGauge.dashOffset, 0);
  assert.equal(maxGauge.statusLabel, '잠시 멈춤 권장');
  assert.ok(maxGauge.needleTipX > 110);
});

test('DRIVING_MODES and createInitialDriverGreeting adapt to chosen mode', () => {
  assert.equal(DRIVING_MODES.length, 3);
  assert.equal(getDrivingModeOption('perspective').label, '다른 시각 모드');

  const greeting = createInitialDriverGreeting(
    {
      category: '친구 관계',
      emotion: '서운함',
      intensity: 6,
      concernText: '친구가 제 말을 계속 끊어서 서운해요.',
    },
    {
      emotions: ['서운함', '외로움', '망설임'],
      intensity: 6,
      core: '대화 속에서 존중받지 못해 서운함이 쌓였습니다.',
      blindspot: '상대의 습관이나 조급함일 가능성도 있어요.',
      values: ['존중', '우정'],
    },
    'organize',
  );

  assert.equal(greeting.role, 'driver');
  assert.equal(greeting.mode, 'organize');
  assert.ok(greeting.text.includes('대화 속에서 존중받지 못해 서운함이 쌓였습니다.'));
});

test('validateChatMessage enforces non-empty and max-length rules', () => {
  assert.equal(validateChatMessage('   ').valid, false);
  assert.equal(validateChatMessage('a'.repeat(801)).valid, false);
  assert.equal(validateChatMessage('솔직히 먼저 말 걸기가 겁나요.').valid, true);
});

test('buildLocalDriveHighlights and shouldAutoSummarizeDrive track turns and modes cleanly', () => {
  const msgs: ChatMessage[] = [
    { id: 'd0', role: 'driver', text: '안녕하세요.', mode: 'listen', timestampLabel: '10:00' },
    { id: 'u1', role: 'user', text: '친구가 제 말을 무시해요.', mode: 'listen', timestampLabel: '10:01' },
    { id: 'd1', role: 'driver', text: '많이 서운하셨겠어요.', mode: 'listen', timestampLabel: '10:01' },
    { id: 'u2', role: 'user', text: '어떻게 꺼내야 할지 몰라서 막막해요.', mode: 'organize', timestampLabel: '10:02' },
    { id: 'd2', role: 'driver', text: '가장 조심스러운 부분이 무엇인가요?', mode: 'organize', timestampLabel: '10:02' },
  ];

  const highlights = buildLocalDriveHighlights(
    {
      category: '친구 관계',
      emotion: '서운함',
      intensity: 7,
      concernText: '모둠 과제에서 서운함이 쌓였어요.',
    },
    null,
    msgs,
  );

  assert.equal(highlights.userTurnCount, 2);
  assert.deepEqual(highlights.usedModeLabels, ['들어주기', '같이 정리하기']);
  assert.equal(highlights.recentUserNotes.length, 2);

  assert.equal(shouldAutoSummarizeDrive(msgs.slice(0, 3), 0), false);
  assert.equal(shouldAutoSummarizeDrive(msgs, 0), true);
  assert.equal(shouldAutoSummarizeDrive(msgs, 5), false);
});

test('parseDriveLogSummary parses valid summary JSON and rejects incomplete payload', () => {
  const validJson = JSON.stringify({
    currentTopic: '친구와의 거리감 조절',
    keyPoints: ['서운함을 말하면 어색해질까 걱정됨', '의견이 무시된 느낌이 반복됨'],
    recentFlow: '초기 서운함에서 출발해 대화를 어떻게 꺼낼지 고민하는 단계로 옮겨왔습니다.',
    nextFocus: '서운함을 전할 때 꼭 지키고 싶은 기준 한 가지를 정리해 보기',
  });

  const parsed = parseDriveLogSummary(validJson);
  assert.equal(parsed.currentTopic, '친구와의 거리감 조절');
  assert.equal(parsed.keyPoints.length, 2);

  assert.throws(() => parseDriveLogSummary(JSON.stringify({ currentTopic: '', keyPoints: [] })));
});

test('selectWarningLight maps blindspot themes and intensity to automotive telltales', () => {
  const battery = selectWarningLight('스스로를 돌볼 여유가 부족해요.', 6, '지침');
  assert.equal(battery.id, 'battery');

  const engine = selectWarningLight('솔직한 표현으로 대화를 풀어가면 오해가 줄어들 수 있어요.', 5, '서운함');
  assert.equal(engine.id, 'engine');

  const master = selectWarningLight('상대도 상황이 다를 수 있어요.', 9, '화남');
  assert.equal(master.id, 'master');
  assert.equal(master.isHighAlert, true);

  const blindspot = selectWarningLight('상대방 쪽의 배경과 입장을 함께 비춰볼 수 있어요.', 4, '답답함');
  assert.equal(blindspot.id, 'blindspot');
  assert.equal(blindspot.isHighAlert, false);
});

test('MindDiary validation, upsert, remove, and storage persistence work reliably', () => {
  assert.equal(validateMindDiaryLine('  ').valid, false);
  assert.equal(validateMindDiaryLine('a'.repeat(141)).valid, false);
  assert.equal(validateMindDiaryLine('먼저 마음을 꺼내 보니 조금 후련해졌어요.').valid, true);
  assert.equal(formatKoreanDateLabel('2026-11-22'), '2026년 11월 22일');

  const initial: MindDiaryEntry[] = [
    {
      id: 'diary-2026-11-21',
      dateKey: '2026-11-21',
      emotion: '불안함',
      oneLine: '시험 계획표를 다시 세웠더니 마음이 덜 흔들렸다.',
      updatedAt: '2026-11-21T10:00:00.000Z',
    },
  ];

  const added = upsertMindDiaryEntry(initial, {
    dateKey: '2026-11-22',
    emotion: '서운함',
    oneLine: '서운함을 무조건 참지 않고 부드럽게 말해 보기로 했다.',
    category: '친구 관계',
  });
  assert.equal(added.length, 2);
  assert.equal(added[0].dateKey, '2026-11-22');

  const updated = upsertMindDiaryEntry(added, {
    dateKey: '2026-11-22',
    emotion: '지침',
    oneLine: '오늘은 일찍 쉬고 내일 다시 대화해 보자.',
    category: '친구 관계',
  });
  assert.equal(updated.length, 2);
  assert.equal(updated[0].emotion, '지침');
  assert.equal(updated[0].oneLine, '오늘은 일찍 쉬고 내일 다시 대화해 보자.');

  const store = new Map<string, string>();
  saveMindDiaryEntries(updated, {
    setItem: (k, v) => {
      store.set(k, v);
    },
  });
  const loaded = loadMindDiaryEntries({
    getItem: (k) => store.get(k) ?? null,
  });
  assert.equal(loaded.length, 2);
  assert.equal(loaded[0].oneLine, '오늘은 일찍 쉬고 내일 다시 대화해 보자.');
  assert.equal(parseStoredMindDiary('invalid-json').length, 0);
  assert.ok(store.has(MIND_DIARY_STORAGE_KEY));

  const removed = removeMindDiaryEntry(loaded, '2026-11-22');
  assert.equal(removed.length, 1);
  assert.equal(removed[0].dateKey, '2026-11-21');
});

test('getDrivingBackdropConfig adapts pacing by driving mode and colors by emotion', () => {
  const listenCfg = getDrivingBackdropConfig('서운함', 'listen');
  const organizeCfg = getDrivingBackdropConfig('서운함', 'organize');
  const perspectiveCfg = getDrivingBackdropConfig('불안함', 'perspective');

  assert.ok(listenCfg.laneDurationSec > organizeCfg.laneDurationSec);
  assert.ok(organizeCfg.laneDurationSec > perspectiveCfg.laneDurationSec);
  assert.ok(listenCfg.horizonDurationSec > listenCfg.lampsDurationSec);
  assert.notEqual(listenCfg.skyTop, perspectiveCfg.skyTop);
  assert.ok(perspectiveCfg.laneDashColor.startsWith('#'));
});

test('formatGeminiUserError masks raw JSON/quota errors behind friendly Korean guidance', () => {
  const raw429 = JSON.stringify({
    error: {
      code: 429,
      message: 'You exceeded your current quota https://aistudio.google.com/docs/rate-limits',
      status: 'RESOURCE_EXHAUSTED',
    },
  });
  assert.equal(isQuotaExhaustedMessage(raw429), true);
  const formatted429 = formatGeminiUserError(new Error(raw429), 'analyze');
  assert.equal(formatted429.statusCode, 429);
  assert.ok(!formatted429.message.includes('RESOURCE_EXHAUSTED'));
  assert.ok(!formatted429.message.includes('http'));

  const formattedUnknown = formatGeminiUserError(new Error('Internal failure'), 'drive');
  assert.equal(formattedUnknown.statusCode, 500);
  assert.ok(formattedUnknown.message.includes('기사님'));
});

test('parseSafeApiJson and shouldRetryProxyResponse handle non-JSON proxy errors safely', () => {
  const proxyText = 'The page could not be loaded. Please try again later.';
  assert.equal(shouldRetryProxyResponse(502, proxyText), true);
  assert.equal(shouldRetryProxyResponse(200, proxyText), true);
  assert.equal(shouldRetryProxyResponse(200, '{"status":"ok"}'), false);
  assert.equal(shouldRetryProxyResponse(400, '{"error":"잘못된 입력"}'), false);

  assert.throws(
    () => parseSafeApiJson(proxyText, 502, '기본 안내'),
    (err: unknown) =>
      err instanceof Error &&
      !err.message.includes('The page') &&
      !err.message.includes('Unexpected token') &&
      err.message.includes('혼잡'),
  );

  assert.throws(
    () => parseSafeApiJson('<html><body>503 Service Unavailable</body></html>', 503, '기본 안내'),
    (err: unknown) =>
      err instanceof Error && !err.message.includes('<html') && err.message.includes('혼잡'),
  );

  assert.throws(
    () => parseSafeApiJson('', 500, '기본 안내'),
    (err: unknown) => err instanceof Error && err.message.includes('혼잡'),
  );

  const ok = parseSafeApiJson<{ status: string }>('{"status":"ok"}', 200, '기본 안내');
  assert.equal(ok.status, 'ok');
});

test('formatClientNetworkError masks SyntaxError and network errors while keeping Korean errors', () => {
  const syntaxErr = new SyntaxError('Unexpected token \'T\', "The page c"... is not valid JSON');
  const analyzeMsg = formatClientNetworkError(syntaxErr, 'analyze');
  assert.ok(!analyzeMsg.includes('Unexpected token'));
  assert.ok(!analyzeMsg.includes('JSON'));
  assert.ok(analyzeMsg.includes('계기판'));

  const fetchErr = new TypeError('Failed to fetch');
  const driveMsg = formatClientNetworkError(fetchErr, 'drive');
  assert.ok(!driveMsg.includes('Failed to fetch'));
  assert.ok(driveMsg.includes('기사님'));

  const abortErr = new Error('The user aborted a request.');
  abortErr.name = 'AbortError';
  assert.ok(formatClientNetworkError(abortErr, 'summary').includes('시간이 길어져'));

  const koreanMsg = formatClientNetworkError(
    new Error('오늘 AI 응답 이용 한도가 잠시 모두 소진되어 쉬어가고 있어요.'),
    'analyze',
  );
  assert.equal(koreanMsg, '오늘 AI 응답 이용 한도가 잠시 모두 소진되어 쉬어가고 있어요.');
});
