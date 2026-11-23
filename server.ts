import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  formatGeminiUserError,
  isQuotaExhaustedMessage,
  parseAnalystResult,
  parseDriveLogSummary,
} from './src/lib/daeriLogic.ts';

const PRIMARY_MODEL = 'gemini-4-hydrogen';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY 환경 변수가 설정되어 있지 않습니다.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function withGeminiRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  skipQuotaRetry = false,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (
        (skipQuotaRetry && isQuotaExhaustedMessage(msg)) ||
        (isQuotaExhaustedMessage(msg) &&
          /GenerateRequestsPerDay|exceeded your current quota/i.test(msg))
      ) {
        throw err;
      }
      const isTransient =
        /500|502|503|504|429|UNAVAILABLE|RESOURCE_EXHAUSTED|DEADLINE_EXCEEDED|ECONNRESET|ETIMEDOUT/i.test(
          msg,
        );
      if (!isTransient || attempt === maxAttempts) {
        throw err;
      }
      const jitter = Math.floor(Math.random() * 250);
      const delayMs = 650 * attempt + jitter;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

const PRIMARY_QUOTA_COOLDOWN_MS = 60 * 60 * 1000;
const TRANSIENT_PRIMARY_COOLDOWN_MS = 5 * 60 * 1000;
const GEMINI_CALL_TIMEOUT_MS = 16000;
let primaryQuotaCooldownUntil = 0;

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`DEADLINE_EXCEEDED: ${label} timed out after ${ms}ms`));
        }, ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

interface GeminiCallResult {
  text?: string;
  candidates?: Array<{ finishReason?: unknown }>;
}

async function generateWithModelFallback(
  _ai: GoogleGenAI,
  callForModel: (model: string) => Promise<GeminiCallResult>,
): Promise<GeminiCallResult> {
  if (Date.now() < primaryQuotaCooldownUntil) {
    return await withGeminiRetry(
      () => withTimeout(callForModel(FALLBACK_MODEL), GEMINI_CALL_TIMEOUT_MS, FALLBACK_MODEL),
      3,
      false,
    );
  }

  try {
    return await withGeminiRetry(
      () => withTimeout(callForModel(PRIMARY_MODEL), GEMINI_CALL_TIMEOUT_MS, PRIMARY_MODEL),
      2,
      true,
    );
  } catch (primaryErr: unknown) {
    const msg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
    if (isQuotaExhaustedMessage(msg)) {
      const isDaily = /GenerateRequestsPerDay|exceeded your current quota/i.test(msg);
      primaryQuotaCooldownUntil =
        Date.now() + (isDaily ? PRIMARY_QUOTA_COOLDOWN_MS : TRANSIENT_PRIMARY_COOLDOWN_MS);
    }
    const shouldTryFallback =
      isQuotaExhaustedMessage(msg) ||
      /UNAVAILABLE|DEADLINE_EXCEEDED|NOT_FOUND|\b502\b|\b503\b|\b504\b/i.test(msg);
    if (!shouldTryFallback) {
      throw primaryErr;
    }
    return await withGeminiRetry(
      () => withTimeout(callForModel(FALLBACK_MODEL), GEMINI_CALL_TIMEOUT_MS, FALLBACK_MODEL),
      3,
      false,
    );
  }
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

function checkServerSafety(text: string): 'safe' | 'crisis' | 'harassment' {
  for (const p of CRISIS_PATTERNS) {
    if (p.test(text)) return 'crisis';
  }
  for (const p of HARASSMENT_PATTERNS) {
    if (p.test(text)) return 'harassment';
  }
  return 'safe';
}

const ANALYST_SYSTEM_INSTRUCTION = `당신은 '대리기사' 마음 운행 서비스의 1번 역할인 '분석가'입니다.
학생이나 선생님이 털어놓은 고민을 판단하거나 훈계하지 않고, 자동차 계기판처럼 차분하고 정확하게 마음 상태를 진단합니다.

반드시 지켜야 할 규칙:
1. 사용자가 말하지 않은 사실을 절대 지어내지 마세요.
2. 실존 인물을 흉내 내거나 진단(병명 부여 등)을 내리지 마세요.
3. 따뜻하고 존중하는 한국어 문장으로 작성하되, 계기판 카드에 담길 수 있도록 군더더기 없이 명확하게 씁니다.
4. emotions에는 사용자의 글과 선택한 감정을 바탕으로 섬세한 한국어 감정 단어 정확히 3개를 담습니다.
5. intensity는 사용자가 입력한 강도를 참고하되 고민의 무게를 반영한 1~10 사이 정수입니다.
6. core는 지금 사용자의 핵심 고민을 1문장으로 정리합니다.
7. blindspot은 사용자가 지금 감정에 가려 놓치고 있을 수 있는 관점, 맥락, 혹은 자기 자신에 대한 배려를 부드러운 어조 1~2문장으로 알려줍니다.
8. values는 지금 마음속에서 부딪히고 있는 가치 2개를 대조 형태로 혹은 각각의 단어/구로 담습니다 (예: ["솔직한 표현", "관계의 평화"]).
9. 출력은 반드시 지정된 JSON 스키마만 반환하세요.`;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/analyze', async (req, res) => {
    try {
      const { category, emotion, intensity, concernText } = req.body ?? {};

      if (
        typeof category !== 'string' ||
        typeof emotion !== 'string' ||
        typeof concernText !== 'string' ||
        !concernText.trim()
      ) {
        return res.status(400).json({
          error: '고민 종류, 감정, 고민 내용을 모두 입력해 주세요.',
        });
      }

      const trimmedText = concernText.trim();
      if (trimmedText.length < 4) {
        return res.status(400).json({
          error: '조금만 더 구체적으로 적어 주시면 계기판을 정확히 점검할 수 있어요.',
        });
      }

      const safety = checkServerSafety(trimmedText);
      if (safety !== 'safe') {
        return res.json({
          status: 'safety_blocked',
          safetyLevel: safety,
        });
      }

      const parsedIntensity = Math.min(10, Math.max(1, Math.round(Number(intensity) || 5)));

      const ai = createGeminiClient();
      const userPrompt = [
        `고민 종류: ${category}`,
        `사용자가 고른 현재 감정: ${emotion}`,
        `사용자가 느낀 감정 강도(1~10): ${parsedIntensity}`,
        `고민 내용:\n${trimmedText}`,
      ].join('\n');

      const response = await generateWithModelFallback(ai, (model) =>
        ai.models.generateContent({
          model,
          contents: userPrompt,
          config: {
            systemInstruction: ANALYST_SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            thinkingConfig: {
              thinkingLevel:
                model === FALLBACK_MODEL ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW,
            },
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                emotions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '사용자의 마음을 나타내는 감정 단어 3개',
                },
                intensity: {
                  type: Type.INTEGER,
                  description: '1부터 10 사이의 감정 강도',
                },
                core: {
                  type: Type.STRING,
                  description: '핵심 고민 한 문장',
                },
                blindspot: {
                  type: Type.STRING,
                  description: '놓치고 있을 수 있는 부분 안내',
                },
                values: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '서로 부딪히고 있는 가치 2개 내외',
                },
              },
              required: ['emotions', 'intensity', 'core', 'blindspot', 'values'],
            },
          },
        }),
      );

      const rawText = response.text;
      if (!rawText) {
        return res.status(500).json({
          error: '계기판 분석 응답이 비어 있습니다. 잠시 후 다시 시도해 주세요.',
        });
      }

      let parsed: unknown;
      try {
        parsed = parseAnalystResult(rawText);
      } catch {
        return res.status(500).json({
          error: '계기판 분석 결과를 정리하는 중 형식이 어긋났어요. 다시 한 번 점검해 주세요.',
        });
      }

      return res.json({
        status: 'ok',
        analysis: parsed,
      });
    } catch (err: unknown) {
      console.error('[/api/analyze] error:', err);
      const formatted = formatGeminiUserError(err, 'analyze');
      return res.status(formatted.statusCode).json({
        error: formatted.message,
      });
    }
  });

  app.post('/api/drive', async (req, res) => {
    try {
      const { input, analysis, mode, messages, userMessage } = req.body ?? {};

      if (typeof userMessage !== 'string' || !userMessage.trim()) {
        return res.status(400).json({
          error: '전하고 싶은 말을 입력해 주세요.',
        });
      }

      const trimmedMsg = userMessage.trim();
      if (trimmedMsg.length > 800) {
        return res.status(400).json({
          error: '메시지는 800자 이내로 작성해 주세요.',
        });
      }

      const safety = checkServerSafety(trimmedMsg);
      if (safety !== 'safe') {
        return res.json({
          status: 'safety_blocked',
          safetyLevel: safety,
        });
      }

      const safeMode: 'listen' | 'organize' | 'perspective' =
        mode === 'organize' || mode === 'perspective' ? mode : 'listen';

      const modeInstructions: Record<'listen' | 'organize' | 'perspective', string> = {
        listen: `현재 모드: 들어주기 (공감만)
- 조언, 해결책, 반론을 제시하지 마세요.
- 사용자의 감정을 먼저 따뜻하게 인정해 주고, 마음이 조금 더 나올 수 있도록 부드러운 공감과 짧은 열린 질문으로 이어가세요.`,
        organize: `현재 모드: 같이 정리하기 (질문)
- 사용자의 감정을 먼저 인정한 뒤, 상황이나 마음속 가치 갈등을 정리하는 데 도움이 되는 핵심 질문을 1개 건네세요.
- 가르치려 들지 말고, 사용자 스스로 답을 찾을 수 있도록 생각의 갈래를 짚어 주세요.`,
        perspective: `현재 모드: 다른 시각 모드 (반대 입장에서 토론)
- 먼저 사용자의 감정과 서운함/어려움을 분명히 인정하세요.
- 그런 다음 사용자를 공격하거나 비난하지 말고, "한편으로 상대(또는 다른 입장) 쪽에서는 이렇게 느꼈을 수도 있지 않을까요?"처럼 정중하고 차분하게 다른 시각을 제시하고 사용자의 생각을 물어보세요.`,
      };

      const driverSystemInstruction = `당신은 '대리기사' 마음 운행 서비스의 2번 역할인 '기사님'입니다.
따뜻하고 차분한 베테랑 운전기사처럼, 학생이나 선생님의 조수석에 함께 앉아 이야기를 들어 줍니다.

반드시 지켜야 할 규칙:
1. 한 번에 반드시 1~3문장 이내로 간결하고 따뜻하게 답하세요.
2. 판단하거나 훈계하지 마세요. 항상 사용자의 감정을 먼저 인정하고 시작하세요.
3. 사용자가 말을 더 꺼낼 수 있도록 자연스럽게 여지를 남기거나 부드러운 질문을 덧붙이세요.
4. 사용자가 말하지 않은 사실을 지어내지 말고, 실존 인물을 흉내 내지 마세요.
5. 대리기사는 의사나 상담사가 아니므로 의학적 진단이나 치료 지시를 하지 마세요.
6. 욕설·협박·괴롭힘 목적의 문장을 대신 써달라는 요청에는 정중히 거절하고 감정을 안전하게 정리하는 방향으로 안내하세요.

${modeInstructions[safeMode]}`;

      const historyLines = Array.isArray(messages)
        ? messages
            .slice(-12)
            .map((m: unknown) => {
              if (!m || typeof m !== 'object') return '';
              const rec = m as Record<string, unknown>;
              const speaker = rec.role === 'user' ? '사용자' : '기사님';
              const text = typeof rec.text === 'string' ? rec.text.trim() : '';
              return text ? `${speaker}: ${text}` : '';
            })
            .filter(Boolean)
            .join('\n')
        : '';

      const contextParts = [
        `[탑승 정보]`,
        `- 고민 종류: ${typeof input?.category === 'string' ? input.category : '기타'}`,
        `- 선택한 감정: ${typeof input?.emotion === 'string' ? input.emotion : '서운함'} (강도 ${Number(input?.intensity) || 5}/10)`,
        `- 처음 적어 준 고민: ${typeof input?.concernText === 'string' ? input.concernText : ''}`,
      ];

      if (analysis && typeof analysis === 'object') {
        const a = analysis as Record<string, unknown>;
        contextParts.push(
          `[계기판 분석 요약]`,
          `- 핵심 고민: ${typeof a.core === 'string' ? a.core : ''}`,
          `- 충돌하는 가치: ${Array.isArray(a.values) ? a.values.join(' vs ') : ''}`,
        );
      }

      if (historyLines) {
        contextParts.push(`[지금까지의 운행 대화]\n${historyLines}`);
      }

      contextParts.push(`[방금 사용자의 말]\n사용자: ${trimmedMsg}`);
      contextParts.push(`위 맥락을 바탕으로 '기사님'으로서 1~3문장으로 응답하세요.`);

      const ai = createGeminiClient();
      const response = await generateWithModelFallback(ai, (model) =>
        ai.models.generateContent({
          model,
          contents: contextParts.join('\n\n'),
          config: {
            systemInstruction: driverSystemInstruction,
            thinkingConfig: {
              thinkingLevel:
                model === FALLBACK_MODEL ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW,
            },
          },
        }),
      );

      const replyText = (response.text ?? '').trim();
      if (!replyText) {
        const finishReason = String(response.candidates?.[0]?.finishReason ?? '');
        if (/SAFETY|PROHIBITED_CONTENT|BLOCKLIST/i.test(finishReason)) {
          return res.json({
            status: 'ok',
            reply:
              '방금 꺼내 주신 이야기에는 조심스럽게 다뤄야 할 감정이 담겨 있네요. 자극적인 표현은 조금 덜어내고 지금 가장 힘들거나 서운한 마음의 핵심만 편하게 다시 들려주시겠어요?',
          });
        }
        return res.status(500).json({
          error: '기사님의 답변을 불러오지 못했습니다. 다시 한 번 말씀해 주시겠어요?',
        });
      }

      return res.json({
        status: 'ok',
        reply: replyText,
      });
    } catch (err: unknown) {
      console.error('[/api/drive] error:', err);
      const formatted = formatGeminiUserError(err, 'drive');
      return res.status(formatted.statusCode).json({
        error: formatted.message,
      });
    }
  });

  app.post('/api/drive-summary', async (req, res) => {
    try {
      const { input, analysis, messages } = req.body ?? {};

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({
          error: '요약할 운행 대화 기록이 아직 없습니다.',
        });
      }

      const validMessages = messages
        .slice(-24)
        .map((m: unknown) => {
          if (!m || typeof m !== 'object') return null;
          const rec = m as Record<string, unknown>;
          const role = rec.role === 'user' ? 'user' : 'driver';
          const text = typeof rec.text === 'string' ? rec.text.trim() : '';
          if (!text) return null;
          return { role, text };
        })
        .filter((item): item is { role: 'user' | 'driver'; text: string } => Boolean(item));

      const hasUserTurn = validMessages.some((m) => m.role === 'user');
      if (!hasUserTurn) {
        return res.status(400).json({
          error: '사용자와의 대화가 한 번 이상 오간 뒤에 운행 일지를 요약할 수 있어요.',
        });
      }

      for (const m of validMessages) {
        if (m.role === 'user') {
          const safety = checkServerSafety(m.text);
          if (safety !== 'safe') {
            return res.json({
              status: 'safety_blocked',
              safetyLevel: safety,
            });
          }
        }
      }

      const summarySystemInstruction = `당신은 '대리기사' 마음 운행 서비스의 운행 일지 기록자입니다.
대화 중간에 사용자가 지금까지의 흐름을 놓치지 않도록, 현재까지 오간 대화를 간결하고 따뜻하게 정리해 줍니다.

반드시 지켜야 할 규칙:
1. 사용자가 실제로 말한 내용과 기사님과의 대화 흐름만 바탕으로 요약하세요. 말하지 않은 사실을 지어내지 마세요.
2. 판단하거나 훈계하지 말고, 따뜻한 메모처럼 존중하는 한국어로 쓰세요.
3. currentTopic: 지금까지 대화가 모이고 있는 핵심 주제를 1개의 짧은 명사형 구 또는 1문장으로 정리하세요.
4. keyPoints: 지금까지 드러난 핵심 감정·상황·발견 2~3가지를 각 1문장 이내로 간결하게 적으세요.
5. recentFlow: 처음 고민에서 출발해 지금 대화의 초점이 어디까지 이어졌는지 1~2문장으로 자연스럽게 연결해 주세요.
6. nextFocus: 이어서 조금 더 들여다보거나 정리해 보면 좋을 방향을 1문장으로 부드럽게 제안하세요.
7. 반드시 지정된 JSON 스키마만 반환하세요.`;

      const transcript = validMessages
        .map((m) => `${m.role === 'user' ? '사용자' : '기사님'}: ${m.text}`)
        .join('\n');

      const promptParts = [
        `[탑승 정보]`,
        `- 고민 종류: ${typeof input?.category === 'string' ? input.category : '기타'}`,
        `- 선택한 감정: ${typeof input?.emotion === 'string' ? input.emotion : '서운함'}`,
        `- 처음 고민: ${typeof input?.concernText === 'string' ? input.concernText : ''}`,
      ];

      if (analysis && typeof analysis === 'object') {
        const a = analysis as Record<string, unknown>;
        if (typeof a.core === 'string' && a.core.trim()) {
          promptParts.push(`- 계기판 핵심 고민: ${a.core.trim()}`);
        }
      }

      promptParts.push(`[지금까지의 운행 대화 기록]\n${transcript}`);

      const ai = createGeminiClient();
      const response = await generateWithModelFallback(ai, (model) =>
        ai.models.generateContent({
          model,
          contents: promptParts.join('\n\n'),
          config: {
            systemInstruction: summarySystemInstruction,
            responseMimeType: 'application/json',
            thinkingConfig: {
              thinkingLevel:
                model === FALLBACK_MODEL ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW,
            },
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                currentTopic: {
                  type: Type.STRING,
                  description: '현재 대화가 모이고 있는 핵심 주제',
                },
                keyPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '대화에서 드러난 핵심 요점 2~3개',
                },
                recentFlow: {
                  type: Type.STRING,
                  description: '지금까지의 대화 흐름 요약 1~2문장',
                },
                nextFocus: {
                  type: Type.STRING,
                  description: '이어서 함께 살펴볼 다음 방향 1문장',
                },
              },
              required: ['currentTopic', 'keyPoints', 'recentFlow', 'nextFocus'],
            },
          },
        }),
      );

      const rawText = response.text;
      if (!rawText) {
        return res.status(500).json({
          error: '운행 일지 요약 응답이 비어 있습니다. 다시 시도해 주세요.',
        });
      }

      let parsed: unknown;
      try {
        parsed = parseDriveLogSummary(rawText);
      } catch {
        return res.status(500).json({
          error: '운행 일지 요약을 정리하는 중 형식이 어긋났어요. 다시 시도해 주세요.',
        });
      }

      return res.json({
        status: 'ok',
        summary: parsed,
      });
    } catch (err: unknown) {
      console.error('[/api/drive-summary] error:', err);
      const formatted = formatGeminiUserError(err, 'summary');
      return res.status(formatted.statusCode).json({
        error: formatted.message,
      });
    }
  });

  app.use('/api', (_req, res) => {
    return res.status(404).json({
      error: '요청하신 운행 경로를 찾지 못했습니다.',
    });
  });

  app.use(
    '/api',
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error('[/api error middleware]:', err);
      const maybeStatus = (err as { status?: unknown; statusCode?: unknown })?.status ??
        (err as { statusCode?: unknown })?.statusCode;
      const status =
        typeof maybeStatus === 'number' && maybeStatus >= 400 && maybeStatus < 600
          ? maybeStatus
          : 500;
      return res.status(status).json({
        error:
          status === 400
            ? '요청 형식을 읽지 못했습니다. 다시 시도해 주세요.'
            : '서버 연결 처리 중 잠시 오류가 발생했습니다. 다시 시도해 주세요.',
      });
    },
  );

  if (isProduction) {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Daerigisa server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
