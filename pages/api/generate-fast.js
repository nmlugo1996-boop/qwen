import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: true
  },
  maxDuration: 300
};

const REF_DIR = path.join(process.cwd(), "reference");
const MAX_REFERENCE_CHARS = Number(process.env.MAX_REFERENCE_CHARS || 120000);
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 290000);
const DEFAULT_TOP_P = Number(process.env.TOP_P || 0.85);
const DEFAULT_MAX_TOKENS = Number(process.env.MAX_TOKENS || 12000);
const DEFAULT_TEMPERATURE = Number(process.env.TEMPERATURE || 0.42);

const BLOCK_SCHEMAS = {
  cognitive: [
    {
      no: "1.1",
      question:
        "Изменение модели потребления: какой новый рынок открываем? Какую новую / дополнительную монетизируемую ценность предлагаем?"
    },
    {
      no: "1.2",
      question:
        "Изменение технологии потребления: какие новые привычки / ритуалы потребления внедряем?"
    },
    {
      no: "1.3",
      question:
        "Нарративы: как объясняем, что инновация нужна, полезна и выгодна?"
    },
    {
      no: "1.4",
      question:
        "Желаемая когнитивная модель: мысли, ощущения, чувства, поведение"
    },
    {
      no: "1.5",
      question:
        "Какие способы / каналы / приёмы обучения потребителей используем?"
    }
  ],
  sensory: [
    { no: "2.1", question: "Визуальный образ" },
    { no: "2.2", question: "Аудиальный образ" },
    { no: "2.3", question: "Обонятельный образ" },
    { no: "2.4", question: "Осязательный образ" },
    { no: "2.5", question: "Вкусовой образ" }
  ],
  branding: [
    {
      no: "3.1",
      question: "История и самоидентификация"
    },
    {
      no: "3.2",
      question: "Контекст: что помогает, а что мешает"
    },
    {
      no: "3.3",
      question: "Ядро бренда: название, логотип, слоган, key visual"
    },
    {
      no: "3.4",
      question: "Путь клиента"
    },
    {
      no: "3.5",
      question: "Стратегия развития 3–5–10 лет"
    }
  ],
  marketing: [
    {
      no: "4.1",
      question: "Сегменты / позиционирование"
    },
    {
      no: "4.2",
      question: "Линейка продукта"
    },
    {
      no: "4.3",
      question: "Ценообразование"
    },
    {
      no: "4.4",
      question: "Каналы продаж"
    },
    {
      no: "4.5",
      question: "Продвижение"
    }
  ]
};

const OUTPUT_SCHEMA_TEXT = `
Верни строго JSON следующей структуры:

{
  "header": {
    "category": "string",
    "name": "string",
    "audience": "string",
    "pain": "string",
    "innovation": "string",
    "uniqueness": "string"
  },
  "product_core": {
    "one_liner": "string",
    "physical_form": "string",
    "appearance": "string",
    "composition": "string",
    "usage": "string",
    "novelty_mechanism": "string",
    "why_people_will_try_it": "string"
  },
  "blocks": {
    "cognitive": [
      { "no": "1.1", "question": "string", "answer": "string" },
      { "no": "1.2", "question": "string", "answer": "string" },
      { "no": "1.3", "question": "string", "answer": "string" },
      { "no": "1.4", "question": "string", "answer": "string" },
      { "no": "1.5", "question": "string", "answer": "string" }
    ],
    "sensory": [
      { "no": "2.1", "question": "string", "answer": "string" },
      { "no": "2.2", "question": "string", "answer": "string" },
      { "no": "2.3", "question": "string", "answer": "string" },
      { "no": "2.4", "question": "string", "answer": "string" },
      { "no": "2.5", "question": "string", "answer": "string" }
    ],
    "branding": [
      { "no": "3.1", "question": "string", "answer": "string" },
      { "no": "3.2", "question": "string", "answer": "string" },
      { "no": "3.3", "question": "string", "answer": "string" },
      { "no": "3.4", "question": "string", "answer": "string" },
      { "no": "3.5", "question": "string", "answer": "string" }
    ],
    "marketing": [
      { "no": "4.1", "question": "string", "answer": "string" },
      { "no": "4.2", "question": "string", "answer": "string" },
      { "no": "4.3", "question": "string", "answer": "string" },
      { "no": "4.4", "question": "string", "answer": "string" },
      { "no": "4.5", "question": "string", "answer": "string" }
    ]
  },
  "tech": ["string", "string", "string"],
  "packaging": ["string", "string", "string"],
  "star": ["string", "string", "string"],
  "conclusion": "string"
}

ЖЁСТКИЕ ПРАВИЛА:
1. Верни только JSON без markdown.
2. Придумай ОДИН новый конкретный физический продукт, а не абстрактную категорию.
3. Название продукта должно быть брендовым, на русском языке и без латиницы.
4. category — это товарная категория продукта, а не пользовательская фраза и не комментарий.
5. Продукт должен быть реально описан: что это, как выглядит, какого размера, как открывается, как используется, почему его хотят попробовать.
6. product_core должен быть очень конкретным, без воды.
7. innovation и uniqueness должны быть конкретными, а не общими словами.
8. Во всех 4 блоках должно быть ровно по 5 объектов.
9. Если продукт несъедобный, в пункте 2.5 дай не буквальный вкус, а пользовательское ощущение.
10. Нельзя пересказывать методичку и входные данные.
11. Нельзя брать слова пользователя и просто собирать из них название товара.
12. Нельзя возвращать пустые абстрактные фразы вроде "удобный формат", "современный продукт", "понятная выгода", "реальный товар".
13. Сначала мысленно придумай 3 разных концепции, затем выбери лучший и только его верни в JSON.
14. Пиши ТОЛЬКО ПО-РУССКИ. Никакой латиницы, китайских/японских/корейских символов.
15. Имя продукта должно быть ОДИНАКОВЫМ во всём JSON: header.name = то же имя везде.
`;

// ===== анти-повторы / анти-референсы =====
const BAD_NAME_PATTERNS = [
  "новая полка",
  "полярный продукт",
  "новая привычка",
  "полярный выбор",
  "товар",
  "продукт",
  "утрянка",
  "шоковсянка",
  "сетка",
  "подход",
  "контур",
  "мясовой код",
  "мясовоикод",
  "мясовойкод"
];

const GENERIC_PHRASES = [
  "удобный формат",
  "современный продукт",
  "понятная выгода",
  "реальный товар",
  "инновационный продукт",
  "уникальный продукт",
  "для широкой аудитории",
  "премиальный сегмент",
  "в социальных сетях",
  "активные люди",
  "высокое качество",
  "для всей семьи"
];

// язык
const CJK_RE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/;
const LATIN_RE = /[A-Za-z]/;

// “плотность” / “шоковсянка-стайл”
const PACK_WORDS_RE =
  /(флоу\-пак|flow\-pack|дойпак|саше|стик|зип|zip|клапан|насечк|крышк|фольг|плёнк|картон|короб|лоток|банка|стакан|бутыл|пакет|обёртк|оберт|шов|сегмент|модул|порци)/i;
const UNIT_RE = /\b(\d{1,4})\s?(г|гр|кг|мл|л|мм|см|шт|порц)\b/i;
const DIGIT_RE = /\d/;

function safeRead(absPath) {
  try {
    return fs.readFileSync(absPath, "utf8");
  } catch (error) {
    return "";
  }
}

function getReferenceFiles() {
  try {
    if (!fs.existsSync(REF_DIR)) return [];

    return fs
      .readdirSync(REF_DIR)
      .filter((file) => /\.(md|txt)$/i.test(file))
      .filter((file) => file !== "passport_prompt.txt")
      .sort();
  } catch (error) {
    return [];
  }
}

function buildReferenceLibrary() {
  const files = getReferenceFiles();
  let total = 0;
  const chunks = [];

  for (const file of files) {
    const content = sanitizeLongText(safeRead(path.join(REF_DIR, file)));
    if (!content) continue;

    const chunk = `\n=== РЕФЕРЕНС: ${file} ===\n${content}\n`;
    if (total + chunk.length > MAX_REFERENCE_CHARS) break;

    chunks.push(chunk);
    total += chunk.length;
  }

  return chunks.join("\n").trim();
}

const EXTERNAL_PROMPT = sanitizeLongText(
  safeRead(path.join(REF_DIR, "passport_prompt.txt"))
);

const REFERENCE_LIBRARY = buildReferenceLibrary();

const FALLBACK_SYSTEM_PROMPT = [
  "Ты — профессиональный продуктолог, маркетолог, бренд-стратег, технолог и когнитивный аналитик.",
  "Ты создаёшь КОГНИТИВНО-СЕНСОРНЫЙ ПАСПОРТ нового продукта по логике Полярной Звезды.",
  "Нужно придумать новый, рыночно отличимый, физически понятный продукт.",
  "Ориентируйся по плотности и логике на сильный эталонный КСП, а не на поверхностный AI-текст.",
  OUTPUT_SCHEMA_TEXT
].join("\n\n");

const SYSTEM_PROMPT = [
  EXTERNAL_PROMPT || FALLBACK_SYSTEM_PROMPT,
  REFERENCE_LIBRARY
    ? [
        "НИЖЕ ДАНА БИБЛИОТЕКА РЕФЕРЕНСОВ.",
        "ИСПОЛЬЗУЙ ИХ КАК ОРИЕНТИР ПО ГЛУБИНЕ, СТРУКТУРЕ, СИЛЕ НАРРАТИВА И ПРЕДМЕТНОСТИ.",
        "НЕ КОПИРУЙ ИХ ДОСЛОВНО.",
        "СОЗДАЙ АБСОЛЮТНО НОВЫЙ ПРОДУКТ.",
        REFERENCE_LIBRARY
      ].join("\n\n")
    : "",
  OUTPUT_SCHEMA_TEXT
]
  .filter(Boolean)
  .join("\n\n");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let body;
  try {
    body =
      req.body && typeof req.body === "object"
        ? req.body
        : await readJson(req);
  } catch (error) {
    res.status(400).json({ error: "Invalid JSON payload" });
    return;
  }

  const input = normalizeInput(body);

  try {
    // 1-я попытка
    const firstMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserMessage(input) }
    ];

    const firstDraftRaw = await callTextModel(firstMessages, input.temperature);
    let normalized = normalizeDraft(firstDraftRaw, input);

    // 2-я попытка только при провале гейтов
    if (needsRepair(normalized, input)) {
      const repairMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(input) },
        { role: "assistant", content: JSON.stringify(firstDraftRaw) },
        { role: "user", content: buildRepairMessage(normalized, input) }
      ];

      const repairedRaw = await callTextModel(
        repairMessages,
        clamp(input.temperature + 0.04, 0.22, 0.72)
      );
      normalized = normalizeDraft(repairedRaw, input);
    }

    res.status(200).json(normalized);
  } catch (error) {
    console.error("[generate-fast] error:", error?.message || error);
    res.status(200).json(buildFallbackDraft(input));
  }
}

async function callTextModel(messages, temperature) {
  if (!process.env.QWEN_API_URL || !process.env.QWEN_API_KEY) {
    throw new Error("QWEN_API_URL or QWEN_API_KEY is not configured");
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;

  const timeoutId =
    controller && Number.isFinite(REQUEST_TIMEOUT_MS)
      ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      : null;

  const payloadBase = {
    model: process.env.TEXT_MODEL_NAME,
    messages,
    temperature: clamp(
      Number.isFinite(temperature) ? temperature : DEFAULT_TEMPERATURE,
      0.18,
      0.82
    ),
    top_p: clamp(DEFAULT_TOP_P, 0.1, 1),
    max_tokens: DEFAULT_MAX_TOKENS
  };

  try {
    // 1) пробуем с response_format
    let response = await fetch(process.env.QWEN_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.QWEN_API_KEY}`
      },
      body: JSON.stringify({
        ...payloadBase,
        response_format: { type: "json_object" }
      }),
      signal: controller ? controller.signal : undefined
    });

    // 2) если response_format не поддерживается — повторяем без него
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      const looksLikeResponseFormatIssue =
        response.status === 400 &&
        /response_format|json_object|schema/i.test(text);

      if (looksLikeResponseFormatIssue) {
        response = await fetch(process.env.QWEN_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.QWEN_API_KEY}`
          },
          body: JSON.stringify(payloadBase),
          signal: controller ? controller.signal : undefined
        });
      } else {
        throw new Error(
          `LLM request failed: ${response.status} ${text.slice(0, 1000)}`
        );
      }
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `LLM request failed: ${response.status} ${text.slice(0, 1000)}`
      );
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    const parsed = extractFirstJson(rawContent);

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Model returned empty or invalid JSON");
    }

    return parsed;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("LLM request timed out");
    }
    throw error;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function normalizeInput(body) {
  const source =
    body && typeof body.form === "object" && body.form !== null
      ? body.form
      : body || {};

  const category = sanitizeText(
    source.category ||
      source.niche ||
      source.industry ||
      source.industryName
  );

  const wish = sanitizeText(
    source.wish ||
      source.idea ||
      source.productIdea ||
      source.user_request ||
      source.hypothesis
  );

  const name = sanitizeText(
    source.name ||
      source.productName ||
      source.brandName
  );

  const comment = sanitizeText(
    source.comment ||
      source.additional ||
      source.notes ||
      source.description
  );

  const pain = pickNonEmpty(
    sanitizeText(source.pain),
    sanitizeText(source.pain_point),
    sanitizeText(source.problem),
    Array.isArray(source.pains)
      ? source.pains.map((item) => sanitizeText(item)).filter(Boolean).join(", ")
      : ""
  );

  const audience = normalizeAudience(source);

  const creativity = normalizeCreativity(
    source.creativity || source.creative || source.temperatureLabel
  );

  const diagnostics = normalizeDiagnostics(
    source.diagnostics ||
      source.preferences ||
      source.toggles ||
      source.options ||
      {}
  );

  const tempCandidate =
    typeof source.temperature === "number"
      ? source.temperature
      : typeof body.temperature === "number"
        ? body.temperature
        : creativityToTemperature(creativity);

  return {
    category: pickNonEmpty(category, "Новый продукт"),
    wish,
    name,
    comment,
    pain,
    audience,
    diagnostics,
    creativity,
    temperature: clamp(
      Number.isFinite(tempCandidate) ? tempCandidate : DEFAULT_TEMPERATURE,
      0.18,
      0.82
    )
  };
}

function normalizeAudience(source) {
  const audienceText = sanitizeText(
    source.audience ||
      source.targetAudience ||
      source.target ||
      source.consumer
  );

  const age = sanitizeText(
    source.age ||
      source.ageRange ||
      source.audienceAge
  );

  const gender = sanitizeText(
    source.gender ||
      source.sex ||
      source.audienceGender
  );

  const decision = sanitizeText(
    source.decision ||
      source.buyingDecision ||
      source.model ||
      source.purchaseModel
  );

  const parts = [];

  if (audienceText && !/неважно|любые|все подряд/i.test(audienceText)) parts.push(audienceText);
  if (age && !/неважно|любые|все подряд/i.test(age)) parts.push(`Возраст: ${age}`);
  if (gender && !/неважно|любые|все подряд/i.test(gender)) parts.push(`Пол: ${gender}`);
  if (decision && !/неважно|любые|все подряд/i.test(decision)) parts.push(`Кто выбирает/покупает: ${decision}`);

  return parts
    .join(". ")
    .replace(/\bНеважно\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function normalizeCreativity(value) {
  const text = sanitizeText(value).toLowerCase();

  if (!text) return "средняя";
  if (text.includes("низ")) return "низкая";
  if (text.includes("выс")) return "высокая";
  if (text === "1" || text === "2") return "низкая";
  if (text === "4" || text === "5") return "высокая";

  return "средняя";
}

function creativityToTemperature(creativity) {
  if (creativity === "низкая") return 0.34;
  if (creativity === "высокая") return 0.58;
  return 0.44;
}

function normalizeDiagnostics(raw) {
  const result = {};

  if (!raw || typeof raw !== "object") return result;

  const entries = Object.entries(raw);
  entries.forEach(([key, value]) => {
    result[key] = normalizeYesNo(value);
  });

  return result;
}

function normalizeYesNo(value) {
  const text = sanitizeText(value).toLowerCase();

  if (!text) return null;
  if (["yes", "да", "true", "1", "on"].includes(text)) return "yes";
  if (["no", "нет", "false", "0", "off"].includes(text)) return "no";

  return null;
}

function buildUserMessage(input) {
  const yesBlocks = Object.entries(input.diagnostics || {})
    .filter(([_, value]) => value === "yes")
    .map(([key]) => key);

  const noBlocks = Object.entries(input.diagnostics || {})
    .filter(([_, value]) => value === "no")
    .map(([key]) => key);

  const parts = [
    "ТВОЯ ЗАДАЧА — СНАЧАЛА ПРИДУМАТЬ ОДИН НОВЫЙ ПРОДУКТ, А ПОТОМ ЗАПОЛНИТЬ ПАСПОРТ ИМЕННО ПРО НЕГО.",
    "",
    "ПОРЯДОК РАБОТЫ ОБЯЗАТЕЛЕН:",
    "1) Внутренне придумай 3 разных продуктовых концепции внутри категории (НЕ ПИШИ ИХ В ОТВЕТ).",
    "2) Выбери один самый сильный вариант: новизна + физическая реализуемость + коммерческий потенциал + ясная сцена использования.",
    "3) Зафиксируй ОДИН продукт: что это, форма/размер/масса, как открывается, как используется, в чём новизна.",
    "4) Только после этого заполни JSON-паспорт про этот один выбранный продукт.",
    "",
    "ЗАПРЕЩЕНО:",
    "- пересказывать входные данные как готовый ответ;",
    "- пересказывать методичку;",
    "- брать слова пользователя и просто делать из них название;",
    "- делать абстрактный продукт без физической формы и реального сценария;",
    "- использовать в названии или копировать референсные/липкие имена (Утрянка, Шоковсянка, Сетка, Подход, Контур и т.п.);",
    "- писать что-либо не по-русски; никакой латиницы и CJK-символов;",
    "",
    "ТРЕБОВАНИЕ К СТИЛЮ (КАК ЭТАЛОН):",
    "- не лозунги, а предметность: цифры, упаковка, механизм открытия, сцена использования, полка, ритуал;",
    "- в каждом ответе 1–2 конкретные детали, а не общая теория;",
    "",
    "ВХОДНЫЕ ДАННЫЕ:",
    `Категория: ${input.category || "-"}`,
    `Название от пользователя: ${input.name || "не задано"}`,
    `Целевая аудитория: ${input.audience || "-"}`,
    `Потребительская боль: ${input.pain || "-"}`,
    `Комментарий / пожелания: ${input.comment || "-"}`,
    `Уровень креативности: ${input.creativity || "средняя"}`,
    "",
    "ОСОБЕННО ВАЖНО:",
    "- header.category = товарная категория;",
    "- header.name = сильное брендовое русское название без латиницы;",
    "- product_core.physical_form = физический объект, размер, масса, форма, открытие;",
    "- product_core.appearance = как выглядит продукт и упаковка;",
    "- product_core.composition = состав / конструкция / технология;",
    "- product_core.usage = реальная сцена использования;",
    "- product_core.novelty_mechanism = в чём именно новизна;",
    "- product_core.why_people_will_try_it = почему его реально захотят попробовать;"
  ];

  if (yesBlocks.length) {
    parts.push("");
    parts.push("ЭТИ БЛОКИ РАСКРОЙ ОСОБЕННО ПОДРОБНО:");
    parts.push(yesBlocks.join(", "));
  }

  if (noBlocks.length) {
    parts.push("");
    parts.push("ЭТИ БЛОКИ МОЖНО СДЕЛАТЬ КОРОЧЕ, НО БЕЗ ПОТЕРИ ПРЕДМЕТНОСТИ:");
    parts.push(noBlocks.join(", "));
  }

  parts.push("");
  parts.push("ВЕРНИ ТОЛЬКО JSON БЕЗ MARKDOWN И БЕЗ ПОЯСНЕНИЙ.");

  return parts.join("\n");
}

// ===== ГЕЙТЫ “ШОКОВСЯНКА” =====
function densityScore(text) {
  const t = sanitizeText(text);
  if (!t) return 0;

  let score = 0;

  // базовая длина
  if (t.length >= 120) score += 1;
  if (t.length >= 220) score += 1;
  if (t.length >= 360) score += 1;

  // числа / единицы
  if (DIGIT_RE.test(t)) score += 2;
  if (UNIT_RE.test(t)) score += 2;

  // упаковка / механика
  if (PACK_WORDS_RE.test(t)) score += 2;

  // штраф за клише
  const low = t.toLowerCase();
  const hits = GENERIC_PHRASES.filter((p) => low.includes(p)).length;
  score -= hits * 2;

  return score;
}

function passportDensityGate(draft) {
  // собираем ключевые места: product_core + упаковка/тех + пару блоков
  const core = draft?.product_core || {};
  const texts = [
    core.one_liner,
    core.physical_form,
    core.appearance,
    core.composition,
    core.usage,
    core.novelty_mechanism,
    core.why_people_will_try_it,
    ...(Array.isArray(draft?.packaging) ? draft.packaging : []),
    ...(Array.isArray(draft?.tech) ? draft.tech : [])
  ];

  // дополнительно: по одному ответу из sensory + marketing (часто там вылезает “плакатность”)
  const s0 = draft?.blocks?.sensory?.[0]?.answer;
  const s4 = draft?.blocks?.sensory?.[4]?.answer;
  const m2 = draft?.blocks?.marketing?.[2]?.answer;
  if (s0) texts.push(s0);
  if (s4) texts.push(s4);
  if (m2) texts.push(m2);

  const total = texts.reduce((acc, x) => acc + densityScore(x), 0);

  // Порог под “Шоковсянку”: если core/упаковка пустые и без цифр — не проходит.
  return total >= 18;
}

function detectLanguageViolations(draft) {
  const all = collectAllText(draft);
  const probs = [];
  if (CJK_RE.test(all)) probs.push("cjk");
  if (LATIN_RE.test(all)) probs.push("latin");
  return probs;
}

function detectNameDrift(draft) {
  const headerName = sanitizeText(draft?.header?.name);
  if (!headerName) return null;

  const text = collectAllText(draft);

  // 1) "Название — X"
  const m1 = text.match(/Название\s*[-—:]\s*([А-ЯЁ][А-Яа-яЁё0-9\-]{2,40})/);
  if (m1 && m1[1] && m1[1] !== headerName) return m1[1];

  // 2) "X выглядит ..."
  const m2 = text.match(/([А-ЯЁ][А-Яа-яЁё0-9\-]{2,40})\s+выглядит\s+/);
  if (m2 && m2[1] && m2[1] !== headerName) return m2[1];

  // 3) "X — это ..."
  const m3 = text.match(/([А-ЯЁ][А-Яа-яЁё0-9\-]{2,40})\s+—\s+это\s+/);
  if (m3 && m3[1] && m3[1] !== headerName) return m3[1];

  return null;
}

function buildRepairMessage(draft, input) {
  const problems = collectProblems(draft, input);
  const fixedName = sanitizeText(draft?.header?.name) || "";

  return [
    "Ты провалил требования качества. Сделай новый JSON ЦЕЛИКОМ С НУЛЯ.",
    "НЕ ПАТЧ предыдущий ответ. ПЕРЕПРИДУМАЙ продукт заново, но строго в рамках категории и боли.",
    "",
    "СТИЛЬ КАК ЭТАЛОН (ОБЯЗАТЕЛЬНО):",
    "- не лозунги и не общая теория;",
    "- в каждом ответе 1–2 физические детали (цифра/упаковка/механика/сцена/ритуал/полка);",
    "- product_core: масса/размер, упаковка, как открывается, как держится в руке, реальная сцена;",
    "- packaging: тип, материалы, графика, маркер на фронте, механизм вскрытия;",
    "",
    "ОБЯЗАТЕЛЬНО:",
    "- Пиши ТОЛЬКО ПО-РУССКИ. Никаких иероглифов, латиницы, смешанных языков.",
    "- Имя продукта должно быть ОДНО и ТО ЖЕ везде: header.name и упоминания по тексту.",
    fixedName
      ? `- В предыдущей попытке имя было: "${fixedName}". Если оно хорошее — используй это имя везде без замены. Если оно слабое/служебное — придумай новое и используй его везде.`
      : "",
    "",
    "ПРОБЛЕМЫ, КОТОРЫЕ НУЖНО УСТРАНИТЬ:",
    ...problems.map((p, idx) => `${idx + 1}. ${p}`),
    "",
    "Верни только JSON."
  ]
    .filter(Boolean)
    .join("\n");
}

function collectProblems(draft, input) {
  const problems = [];

  const name = sanitizeText(draft?.header?.name).toLowerCase();
  const category = sanitizeText(draft?.header?.category).toLowerCase();
  const innovation = sanitizeText(draft?.header?.innovation).toLowerCase();
  const uniqueness = sanitizeText(draft?.header?.uniqueness).toLowerCase();
  const physical = sanitizeText(draft?.product_core?.physical_form).toLowerCase();
  const appearance = sanitizeText(draft?.product_core?.appearance).toLowerCase();
  const usage = sanitizeText(draft?.product_core?.usage).toLowerCase();

  // язык
  const lang = detectLanguageViolations(draft);
  if (lang.includes("cjk")) problems.push("В ответе есть CJK-символы (китайский/японский/корейский). Это запрещено.");
  if (lang.includes("latin")) problems.push("В ответе есть латиница. Это запрещено (пиши только по-русски).");

  // дрейф имени
  const drift = detectNameDrift(draft);
  if (drift) problems.push(`Обнаружен дрейф имени продукта: найдено другое имя "${drift}" вместо header.name.`);

  // плотность (главный “шоковсянка” гейт)
  if (!passportDensityGate(draft)) problems.push("Недостаточная предметность (плакатный/водянистый текст). Нужны цифры, упаковка, механика, сцена, полка.");

  if (!name || isWeakName(name)) {
    problems.push("Название слабое, шаблонное, референсное или служебное.");
  }

  if (!category || looksLikeUserComment(category, input)) {
    problems.push("Поле category заполнено не товарной категорией.");
  }

  if (!innovation || innovation.length < 35) {
    problems.push("Поле innovation слишком короткое и не объясняет новизну продукта.");
  }

  if (!uniqueness || uniqueness.length < 35) {
    problems.push("Поле uniqueness слишком короткое и не объясняет уникальность продукта.");
  }

  if (isWeakPhysical(physical)) {
    problems.push("Поле product_core.physical_form не описывает физический объект предметно.");
  }

  if (isWeakGeneric(appearance)) problems.push("Поле product_core.appearance слишком общее.");
  if (isWeakGeneric(usage)) problems.push("Поле product_core.usage слишком общее.");

  if (repeatsInputTooDirectly(draft, input)) {
    problems.push("Ответ слишком прямо повторяет входные слова пользователя.");
  }

  if (hasTooManyGenericBlocks(draft)) {
    problems.push("В блоках слишком много шаблонного текста и мало конкретики.");
  }

  return problems.length
    ? problems
    : ["Ответ недостаточно конкретный и выглядит как пересказ, а не как новый продукт."];
}

function needsRepair(draft, input) {
  const problems = collectProblems(draft, input);

  // жёсткий триггер: дрейф имени / не-русский текст / провал плотности
  const hard = problems.some((p) => {
    const low = p.toLowerCase();
    return (
      low.includes("дрейф имени") ||
      low.includes("cjk") ||
      low.includes("латиниц") ||
      low.includes("недостаточная предметность")
    );
  });
  if (hard) return true;

  return problems.length >= 2;
}

function isWeakName(name) {
  const n = String(name || "").toLowerCase().trim();
  if (!n) return true;
  if (LATIN_RE.test(n)) return true;
  if (!/[А-Яа-яЁё]/.test(n)) return true;

  return BAD_NAME_PATTERNS.some((bad) => n.includes(bad));
}

function looksLikeUserComment(category, input) {
  const rawWish = sanitizeText(input.wish).toLowerCase();
  const rawComment = sanitizeText(input.comment).toLowerCase();

  if (!category) return true;
  if (rawWish && category === rawWish) return true;
  if (rawComment && category === rawComment) return true;
  if (category.includes("хочу ") || category.includes("для ")) return true;

  return false;
}

function repeatsInputTooDirectly(draft, input) {
  const text = JSON.stringify(draft).toLowerCase();
  const wish = sanitizeText(input.wish).toLowerCase();
  const comment = sanitizeText(input.comment).toLowerCase();

  let hits = 0;
  if (wish && wish.length > 10 && text.includes(wish)) hits += 1;
  if (comment && comment.length > 10 && text.includes(comment)) hits += 1;

  return hits >= 1;
}

function isWeakPhysical(text) {
  if (!text) return true;

  const bad = [
    "реальный товар",
    "конкретный продукт",
    "физически конкретный",
    "понятный объект",
    "должен быть",
    "может быть"
  ];

  if (bad.some((x) => text.includes(x))) return true;

  if (!DIGIT_RE.test(text) && !PACK_WORDS_RE.test(text) && !UNIT_RE.test(text)) {
    return true;
  }

  return false;
}

function isWeakGeneric(text) {
  if (!text) return true;

  const bad = [
    "должен быть",
    "должна быть",
    "может быть",
    "современный дизайн",
    "понятная польза",
    "удобный формат",
    "без лишнего",
    "новизна создаётся",
    "продукт попробуют"
  ];

  return bad.some((x) => text.includes(x));
}

function hasTooManyGenericBlocks(draft) {
  const texts = [];

  Object.values(draft?.blocks || {}).forEach((block) => {
    if (Array.isArray(block)) {
      block.forEach((item) =>
        texts.push(sanitizeText(item?.answer).toLowerCase())
      );
    }
  });

  const weakCount = texts.filter((text) => {
    const genericHit = GENERIC_PHRASES.some((p) => text.includes(p));
    return (
      genericHit ||
      text.includes("продукт должен") ||
      text.includes("выбираем") ||
      text.includes("строится вокруг") ||
      text.includes("формируем модель") ||
      text.includes("цена должна") ||
      text.includes("каналы выбираем")
    );
  }).length;

  return weakCount >= 5;
}

function normalizeDraft(rawDraft, input) {
  const fallback = buildFallbackDraft(input);

  if (!rawDraft || typeof rawDraft !== "object") {
    return fallback;
  }

  const header = {
    category: forceCategory(
      pickNonEmpty(
        sanitizeText(rawDraft.header?.category),
        sanitizeText(rawDraft.category),
        fallback.header.category
      ),
      input,
      fallback.header.category
    ),
    name: forceName(
      pickNonEmpty(
        sanitizeText(rawDraft.header?.name),
        sanitizeText(rawDraft.name),
        fallback.header.name
      ),
      fallback.header.name
    ),
    audience: forceAudience(
      pickNonEmpty(
        sanitizeText(rawDraft.header?.audience),
        sanitizeText(rawDraft.audience),
        fallback.header.audience
      ),
      fallback.header.audience
    ),
    pain: pickNonEmpty(
      sanitizeText(rawDraft.header?.pain),
      sanitizeText(rawDraft.pain),
      fallback.header.pain
    ),
    innovation: pickNonEmpty(
      sanitizeText(rawDraft.header?.innovation),
      sanitizeText(rawDraft.innovation),
      sanitizeText(rawDraft.header?.uniqueness),
      sanitizeText(rawDraft.uniqueness),
      fallback.header.innovation
    ),
    uniqueness: pickNonEmpty(
      sanitizeText(rawDraft.header?.uniqueness),
      sanitizeText(rawDraft.uniqueness),
      sanitizeText(rawDraft.header?.innovation),
      sanitizeText(rawDraft.innovation),
      fallback.header.uniqueness
    )
  };

  const blocks = {};
  Object.entries(BLOCK_SCHEMAS).forEach(([key, schema]) => {
    const rawBlock = extractBlock(rawDraft, key);
    blocks[key] = schema.map((item, index) => {
      const fallbackItem = fallback.blocks[key][index];
      const answer = pickNonEmpty(
        extractAnswer(rawBlock, item, index),
        fallbackItem.answer
      );

      return {
        no: item.no,
        question: item.question,
        answer
      };
    });
  });

  const productCore = normalizeProductCore(rawDraft.product_core, fallback);
  const tech = normalizeList(rawDraft.tech, fallback.tech).slice(0, 3);
  const packaging = normalizeList(rawDraft.packaging, fallback.packaging).slice(
    0,
    3
  );
  const star = normalizeList(rawDraft.star, fallback.star).slice(0, 3);
  const conclusion = pickNonEmpty(
    sanitizeText(rawDraft.conclusion),
    sanitizeText(rawDraft.summary),
    fallback.conclusion
  );

  return {
    header,
    product_core: productCore,
    blocks,
    tech,
    packaging,
    star,
    conclusion
  };
}

function normalizeProductCore(rawCore, fallback) {
  const fb = fallback.product_core;

  const physical = pickNonEmpty(
    sanitizeText(rawCore?.physical_form),
    fb.physical_form
  );

  return {
    one_liner: pickNonEmpty(sanitizeText(rawCore?.one_liner), fb.one_liner),
    physical_form: isWeakPhysical(physical) ? fb.physical_form : physical,
    appearance: pickNonEmpty(sanitizeText(rawCore?.appearance), fb.appearance),
    composition: pickNonEmpty(
      sanitizeText(rawCore?.composition),
      fb.composition
    ),
    usage: pickNonEmpty(sanitizeText(rawCore?.usage), fb.usage),
    novelty_mechanism: pickNonEmpty(
      sanitizeText(rawCore?.novelty_mechanism),
      fb.novelty_mechanism
    ),
    why_people_will_try_it: pickNonEmpty(
      sanitizeText(rawCore?.why_people_will_try_it),
      fb.why_people_will_try_it
    )
  };
}

function buildFallbackDraft(input) {
  const category = buildFallbackCategory(input);
  const name = buildFallbackName(input, category);
  const audience = pickNonEmpty(
    input.audience,
    "Люди с конкретной потребительской болью и понятным сценарием использования"
  );
  const pain = pickNonEmpty(
    input.pain,
    "Существующие решения закрывают задачу неудобно, скучно или не полностью"
  );
  const innovation = buildFallbackInnovation(category, input);
  const uniqueness = buildFallbackUniqueness(category, input);
  const descriptor = guessDescriptor(category, input);

  const blocks = {
    cognitive: [
      {
        no: "1.1",
        question:
          "Изменение модели потребления: какой новый рынок открываем? Какую новую / дополнительную монетизируемую ценность предлагаем?",
        answer: `Продукт открывает внутри категории "${category}" новый микросегмент, где человек платит не только за базовую функцию, но и за более сильный ритуал, более точную сцену использования и более заметное ощущение контроля над результатом.`
      },
      {
        no: "1.2",
        question:
          "Изменение технологии потребления: какие новые привычки / ритуалы потребления внедряем?",
        answer: descriptor.habit
      },
      {
        no: "1.3",
        question:
          "Нарративы: как объясняем, что инновация нужна, полезна и выгодна?",
        answer: `Нарратив строится не вокруг абстрактной инновации, а вокруг простой мысли: старое решение было неудобным, а ${name} даёт более точный, приятный и современный способ решить ту же задачу без лишнего трения.`
      },
      {
        no: "1.4",
        question:
          "Желаемая когнитивная модель: мысли, ощущения, чувства, поведение",
        answer: `Мысли: я нашёл более умный способ решать свою задачу. Чувства: контроль, облегчение, удовольствие от правильного выбора. Поведение: повторная покупка, интеграция в рутину, рекомендация другим.`
      },
      {
        no: "1.5",
        question:
          "Какие способы / каналы / приёмы обучения потребителей используем?",
        answer: `Обучение идёт через упаковку, короткое объяснение первого сценария, демонстрацию в точке контакта, микроинфлюенсеров и понятный первый пользовательский опыт без длинных инструкций.`
      }
    ],
    sensory: [
      { no: "2.1", question: "Визуальный образ", answer: descriptor.visual },
      { no: "2.2", question: "Аудиальный образ", answer: descriptor.audio },
      { no: "2.3", question: "Обонятельный образ", answer: descriptor.smell },
      { no: "2.4", question: "Осязательный образ", answer: descriptor.touch },
      { no: "2.5", question: "Вкусовой образ", answer: descriptor.taste }
    ],
    branding: [
      {
        no: "3.1",
        question: "История и самоидентификация",
        answer: `${name} усиливает самоощущение человека как того, кто не идёт на старый компромисс, а выбирает более точное и более собранное решение для своей повседневной задачи.`
      },
      {
        no: "3.2",
        question: "Контекст: что помогает, а что мешает",
        answer: `Помогают тренды на новые продуктовые ритуалы, более осознанный выбор и готовность пробовать заметные форматы. Мешают перегретость категории, недоверие к непривычным решениям и слабое объяснение новизны на первом касании.`
      },
      {
        no: "3.3",
        question: "Ядро бренда: название, логотип, слоган, key visual",
        answer: `Название — ${name}. Ядро бренда строится вокруг образа: ${descriptor.brandCore}. Логотип должен быть простым и сильным, а слоган — обещать не общую пользу, а новый способ действия внутри категории.`
      },
      {
        no: "3.4",
        question: "Путь клиента",
        answer: `Человек замечает необычную форму или обещание, быстро понимает сцену использования, пробует продукт в своей реальной ситуации, встраивает его в рутину и начинает рекомендовать как находку, а не как очередную новинку.`
      },
      {
        no: "3.5",
        question: "Стратегия развития 3–5–10 лет",
        answer: `На 3 года бренд закрепляет базовый SKU и основной сценарий. На 5 лет расширяется в линейку по ситуациям использования. На 10 лет превращается в устойчивый продуктовый мир с несколькими форматами и узнаваемым ритуалом.`
      }
    ],
    marketing: [
      {
        no: "4.1",
        question: "Сегменты / позиционирование",
        answer: `Главный сегмент — люди, у которых эта боль возникает регулярно и которые готовы платить за более точный и более удобный сценарий. Позиционирование строится против старого неудобного поведения, а не против всего рынка сразу.`
      },
      {
        no: "4.2",
        question: "Линейка продукта",
        answer: `Первый SKU должен быть самым понятным и самым сильным. Затем линейка расширяется через вкусы, размеры, сценарии использования и соседние форматы без потери ядра продукта.`
      },
      {
        no: "4.3",
        question: "Ценообразование",
        answer: `Цена должна считываться как оправданная за счёт нового сценария, заметной упаковки, более сильного первого опыта и ясной логики использования, а не только за счёт ингредиентов или материала.`
      },
      {
        no: "4.4",
        question: "Каналы продаж",
        answer: `Старт лучше делать там, где сама боль и сцена использования возникают естественно: профильная розница, точечные партнёрские каналы, DTC и понятные места первой пробы. Затем — маркетплейсы и масштабирование.`
      },
      {
        no: "4.5",
        question: "Продвижение",
        answer: `Продвижение должно показывать ритуал и сценарий, а не просто красивый бренд. Лучше всего работают демонстрация использования, объяснение новой логики, микроинфлюенсеры и контент, где за секунды понятно, почему это новый продукт.`
      }
    ]
  };

  return {
    header: {
      category,
      name,
      audience,
      pain,
      innovation,
      uniqueness
    },
    product_core: {
      one_liner: descriptor.oneLiner,
      physical_form: descriptor.physicalForm,
      appearance: descriptor.appearance,
      composition: descriptor.composition,
      usage: descriptor.usage,
      novelty_mechanism: descriptor.novelty,
      why_people_will_try_it: descriptor.tryReason
    },
    blocks,
    tech: descriptor.tech,
    packaging: descriptor.packaging,
    star: descriptor.star,
    conclusion: descriptor.conclusion
  };
}

// ======= ТВОЙ “БОГАТЫЙ” FALLBACK guessDescriptor() — ПОЛНОСТЬЮ =======
function buildFallbackCategory(input) {
  const text = `${input.category} ${input.wish} ${input.comment}`.toLowerCase();

  if (/(батон|спорт|зал|трен|энерг)/.test(text)) {
    return "Функциональный батончик для тренировки";
  }
  if (/(завтрак|школ|дет)/.test(text)) {
    return "Готовый завтрак для школы и дороги";
  }
  if (/(паштет|намаз|паста)/.test(text)) {
    return "Порционный продукт для намазывания и перекуса";
  }
  if (/(напит|пить)/.test(text)) {
    return "Функциональный напиток нового сценария";
  }

  return pickNonEmpty(input.category, "Новый потребительский продукт");
}

function buildFallbackName(input, category) {
  const preferred = sanitizeText(input.name);
  if (
    preferred &&
    !LATIN_RE.test(preferred) &&
    /[А-Яа-яЁё]/.test(preferred) &&
    !isWeakName(preferred.toLowerCase())
  ) {
    return preferred;
  }

  const seed = buildSeed(
    `${category}|${input.wish}|${input.comment}|${input.audience}|${Date.now()}`
  );

  return generateRussianBrandName(seed);
}

function buildSeed(value) {
  const text = String(value || "");
  let hash = 0;

  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }

  return hash;
}

function pickBySeed(items, seed, shift = 0) {
  if (!Array.isArray(items) || !items.length) return "";
  const index = Math.abs((seed + shift) % items.length);
  return items[index];
}

function generateRussianBrandName(seed) {
  const starts = [
    "Ар", "Ве", "Да", "Ле", "Ма", "Но", "Ра", "Со", "Та", "Эс",
    "За", "Ми", "Лу", "Ко", "Ро", "Фе", "Гра", "Бри", "Те", "Са"
  ];

  const middles = [
    "ви", "ро", "на", "ти", "ле", "са", "мо", "ри", "ка", "но",
    "ла", "де", "ми", "си", "во", "ра", "по", "зи", "ше", "ту"
  ];

  const ends = [
    "ка", "на", "ра", "та", "ла", "сия", "ника", "вика", "рия", "сса",
    "лен", "рон", "дара", "вель", "мира", "нта", "эль", "ора", "ина", "ея"
  ];

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const s = (seed + attempt * 9973 + Math.floor(Math.random() * 999)) >>> 0;
    const first = pickBySeed(starts, s, 3);
    const middle = pickBySeed(middles, s, 11);
    const end = pickBySeed(ends, s, 23);

    let name = `${first}${middle}${end}`
      .replace(/аа+/g, "а")
      .replace(/оо+/g, "о")
      .replace(/ее+/g, "е")
      .replace(/ии+/g, "и")
      .trim();

    name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

    if (!isWeakName(name.toLowerCase()) && name.length >= 4) {
      return name;
    }
  }

  return "Лувидара"; // крайне редко; только если 10 попыток провалились
}

function buildFallbackInnovation(category, input) {
  const text = `${category} ${input.wish} ${input.comment}`.toLowerCase();

  if (/(батон|спорт|трен|зал|энерг)/.test(text)) {
    return "Продукт превращает обычный спортивный перекус в поэтапный ритуал внутри самой тренировки, где еда работает как инструмент управления темпом нагрузки.";
  }
  if (/(школ|завтрак|дет)/.test(text)) {
    return "Продукт создаёт отдельный формат школьного завтрака без готовки, ложки и утреннего стресса.";
  }

  return `Продукт создаёт внутри категории "${category}" новый сценарий потребления, в котором форма, ритуал и бренд дают отдельную оплачиваемую ценность.`;
}

function buildFallbackUniqueness(category, input) {
  const text = `${category} ${input.wish} ${input.comment}`.toLowerCase();

  if (/(батон|спорт|трен|зал|энерг)/.test(text)) {
    return "Уникальность в том, что продукт используют не просто как перекус, а как встроенный инструмент самой тренировки, распределяя его по фазам нагрузки.";
  }
  if (/(школ|завтрак|дет)/.test(text)) {
    return "Уникальность в том, что это не сладость и не каша, а отдельный физический формат готового школьного завтрака, который можно дать ребёнку сразу без подготовки.";
  }

  return `Уникальность строится на сочетании нового форм-фактора, ритуала использования и сильного брендового кода внутри категории "${category}".`;
}

function guessDescriptor(category, input) {
  const text = `${category} ${input.wish} ${input.comment}`.toLowerCase();

  if (/(батон|спорт|зал|трен|энерг)/.test(text)) {
    const dynamicName = buildFallbackName(input, category);
    return {
      oneLiner:
        `${dynamicName} — батончик, который используют не как обычный спортивный перекус, а поэтапно во время самой тренировки, чтобы держать темп и не срываться в сладкий перегруз.`,
      physicalForm:
        "Батончик массой 48–52 г, разделённый на 4 функциональные секции по 12–13 г; прямоугольная форма, индивидуальная флоу-пак упаковка со ступенчатым вскрытием по сегментам.",
      appearance:
        "Сам продукт выглядит как плотная сегментированная плитка с рельефными делениями 1–4; упаковка — матовая, графитовая, с контрастной спортивной разметкой и крупным маркером сценария использования.",
      composition:
        "Основа — воздушные злаки, ореховая паста, связка низкой липкости, умеренно быстрые и медленные углеводы, вкусовой акцент без ощущения десерта; рецептура заточена под употребление во время нагрузки.",
      usage:
        "Человек кладёт батончик в спортивную сумку и использует по одной секции между подходами или фазами тренировки, не съедая его целиком за раз.",
      novelty:
        "Новизна возникает из превращения батончика из обычного перекуса в тренировочный интерфейс и ритуал управления темпом нагрузки.",
      tryReason:
        "Его захотят попробовать, потому что он обещает не просто энергию, а новый понятный ритуал внутри самой тренировки.",
      habit:
        "Новый ритуал строится вокруг поэтапного использования батончика по фазам тренировки: продукт не съедают целиком, а используют как встроенную часть тренировочного темпа.",
      visual:
        "Продукт выглядит как сегментированный батончик с визуально читаемыми делениями, а упаковка напоминает разметку спортивного режима: матовая, графитовая, с ярким акцентом и крупной схемой сценария.",
      audio:
        "Аудиальный образ строится на чётком звуке вскрытия и сухом надломе сегмента — без ощущения десертной липкости и мягкости.",
      smell:
        "Обонятельный код — сухой аромат тёмного какао, злаков и лёгкой солоноватой ноты, чтобы продукт считывался как инструмент, а не как сладость.",
      touch:
        "Тактильно батончик должен быть плотным, сухим, рельефным, а упаковка — ступенчатой, чтобы каждая фаза использования ощущалась рукой отдельно.",
      taste:
        "Вкусовой профиль — не десертный, а функциональный: солёный какао-злак, эспрессо-орех, цитрус-соль, чтобы вкус подтверждал тренировочный ритуал, а не подменял его сладостью.",
      brandCore:
        "ритм, подход, фазы нагрузки, дисциплина и собранность",
      tech: [
        "Рецептура должна выдерживать поэтапное употребление без липкости и без грязных рук.",
        "Нужен баланс умеренно быстрых и более медленных углеводов без ощущения тяжёлого десерта.",
        "Конструкция батончика должна держать сегменты чётко, чтобы ритуал работал физически, а не только в рекламе."
      ],
      packaging: [
        "Главный форм-фактор — батончик 48–52 г, разделённый на 4 функциональные секции.",
        "Упаковка должна открываться ступенчато, чтобы поддерживать ритуал по фазам тренировки.",
        "На фронте нужно сразу объяснять: это не просто батончик, а батончик для использования внутри тренировки."
      ],
      star: [
        "У продукта есть новый ритуал, а не просто новый вкус.",
        "Форма и упаковка работают на поведение, а не только на внешний вид.",
        "Идею легко расширять в линейку по тренировочным сценариям."
      ],
      conclusion:
        `${dynamicName} выглядит сильным MVP, потому что превращает привычный спортивный перекус в новый поведенческий инструмент внутри тренировки.`
    };
  }

  if (/(школ|завтрак|дет)/.test(text)) {
    const dynamicName = buildFallbackName(input, category);
    return {
      oneLiner:
        `${dynamicName} — готовый детский завтрак без готовки и без ложки, который родитель может дать сразу в руку или положить в рюкзак по дороге в школу.`,
      physicalForm:
        "Порционный завтрак в формате мягкого бруска или пары мини-брусков общей массой 55–65 г в индивидуальной упаковке; можно есть руками без ложки и без разогрева.",
      appearance:
        "Продукт выглядит как аккуратный многослойный брусок с заметной зерновой фактурой; упаковка яркая, дружелюбная, с крупной фронтальной иконкой пользы и школьного сценария.",
      composition:
        "Основа — злаки, молочная или растительная база, связующий слой, вкусовой слой без избыточной приторности; формула подчинена логике быстрого завтрака без готовки.",
      usage:
        "Продукт дают ребёнку утром дома, в дороге или кладут в рюкзак как готовый завтрак или большой перекус между домом и школой.",
      novelty:
        "Новизна в том, что это не каша и не сладость, а отдельный формат готового школьного завтрака без готовки и без ложки.",
      tryReason:
        "Его попробуют, потому что он решает утреннюю боль семьи быстро, чисто и без борьбы за тарелку.",
      habit:
        "Продукт внедряет новый утренний ритуал: вместо ложки, кастрюли или споров дома родитель даёт ребёнку готовый завтрак в руки или кладёт его в рюкзак как первую часть дня.",
      visual:
        "Визуально продукт дружелюбный, но не инфантильный: понятная форма бруска, яркая упаковка с крупной иконкой пользы и сцены дороги в школу.",
      audio:
        "Аудиальный образ — мягкий, чистый звук вскрытия и лёгкий хруст слоёв, чтобы продукт считывался как готовая еда, а не как конфета.",
      smell:
        "Запах — тёплый, зерновой, с фруктовой или молочной нотой, создающий ощущение полноценного завтрака без необходимости готовить.",
      touch:
        "Тактильно продукт должен быть аккуратным, не липким, удобным для детской руки, а упаковка — открываться быстро и без сильного усилия.",
      taste:
        "Вкус должен быть мягким и спокойным: яблоко-корица, банан-злак, молочный злак с фруктовой нотой, без ощущения десерта и без приторности.",
      brandCore:
        "спокойное утро, готовность, первый шаг дня, контроль без утренней борьбы",
      tech: [
        "Формула должна держать форму без ложки и без разогрева.",
        "Важно избежать десертного ощущения и сохранить завтрачную логику продукта.",
        "Технология должна позволять давать продукт ребёнку сразу в руку без риска липкости и крошения."
      ],
      packaging: [
        "Главный форм-фактор — мягкий брусок или двойной модуль 55–65 г.",
        "Упаковка должна объяснять сценарий: готовый завтрак без готовки.",
        "Открытие должно быть быстрым и чистым, чтобы продукт работал утром в спешке."
      ],
      star: [
        "Продукт решает сильную и частую боль в семье.",
        "У него понятная сцена использования с первого взгляда.",
        "Он создаёт отдельный формат, а не просто очередную сладость."
      ],
      conclusion:
        `${dynamicName} выглядит сильной идеей, потому что создаёт новый формат готового школьного завтрака с очень понятным утренним ритуалом.`
    };
  }

  const dynamicName = buildFallbackName(input, category);

  return {
    oneLiner:
      `${dynamicName} — новый продукт внутри категории, который меняет не только сам товар, но и поведение человека в конкретной сцене использования.`,
    physicalForm:
      "Один основной SKU в понятном порционном формате, рассчитанный на одну сессию использования; конструкция и размер подчинены конкретному сценарию потребления.",
    appearance:
      "Продукт имеет заметную форму, а упаковка — быстро считываемую визуальную логику и один сильный фронтальный маркер новизны.",
    composition:
      "Состав, материалы или конструкция подчинены потребительской боли и не противоречат сценарию использования.",
    usage:
      "Продукт используют в конкретной повторяемой жизненной ситуации, где старые решения были неудобны или слабы.",
    novelty:
      "Новизна появляется из сочетания формы, сценария, ритуала, упаковки и дополнительной воспринимаемой ценности.",
    tryReason:
      "Его попробуют, если человек сразу поймёт, что именно в нём нового и зачем это нужно в реальной жизни.",
    habit:
      "Новая привычка должна встраивать продукт в одну конкретную повторяемую сцену использования, где прежние решения были слабы, неудобны или невыразительны.",
    visual:
      "Визуальный образ должен строиться вокруг заметной формы и одной сильной фронтальной идеи на упаковке.",
    audio:
      "Аудиальный образ должен усиливать первый контакт с продуктом через звук открытия, надлома, наливания или другого ключевого действия.",
    smell:
      "Обонятельный образ должен усиливать обещание продукта и быть связан с его функцией, а не существовать отдельно.",
    touch:
      "Осязательный образ должен делать продукт и упаковку узнаваемыми рукой ещё до использования.",
    taste:
      "Вкусовой образ или пользовательское ощущение должны подтверждать логику продукта и ощущение его новизны.",
    brandCore:
      "новый ритуал, предметность, ясность сценария, сильный маркер новизны",
    tech: [
      "Рецептура, материалы или конструкция должны быть простроены вокруг реальной сцены использования.",
      "Важно быстро сделать MVP без фальшивой инновационности.",
      "Технология должна обслуживать ритуал и логику продукта."
    ],
    packaging: [
      "Форм-фактор и упаковка должны быстро объяснять сцену использования.",
      "На фронте нужен главный маркер новизны и причина попробовать.",
      "Упаковка должна помогать действию, а не только красиво выглядеть."
    ],
    star: [
      "У продукта есть новый ритуал и новая логика категории.",
      "Новизна считывается с формы и упаковки.",
      "Идею можно масштабировать в линейку."
    ],
    conclusion:
      `${dynamicName} выглядит сильным MVP, если сохранить предметность, ритуал и честную новизну без косметических улучшений.`
  };
}
// ======= /ТВОЙ “БОГАТЫЙ” FALLBACK =======

function forceName(name, fallback) {
  const text = sanitizeText(name);
  if (!text) return fallback;
  if (LATIN_RE.test(text)) return fallback;
  if (!/[А-Яа-яЁё]/.test(text)) return fallback;
  if (isWeakName(text.toLowerCase())) return fallback;
  if (text.length < 3) return fallback;
  return text;
}

function forceCategory(category, input, fallback) {
  const text = sanitizeText(category);
  if (!text) return fallback;
  if (looksLikeUserComment(text.toLowerCase(), input)) return fallback;
  return text;
}

function forceAudience(audience, fallback) {
  const text = sanitizeText(audience);
  if (!text) return fallback;
  if (/неважно|любые|все подряд/i.test(text)) return fallback;
  return text;
}

function extractBlock(rawDraft, key) {
  if (!rawDraft || typeof rawDraft !== "object") return null;

  const candidate = rawDraft.blocks?.[key] ?? rawDraft[key];
  if (Array.isArray(candidate) || (candidate && typeof candidate === "object")) {
    return candidate;
  }

  return null;
}

function extractAnswer(rawBlock, item, index) {
  if (!rawBlock) return "";

  if (Array.isArray(rawBlock)) {
    const byNo = rawBlock.find((entry) => matchesNo(entry, item.no));
    if (byNo !== undefined) return sanitizeText(byNo);
    if (rawBlock[index] !== undefined) return sanitizeText(rawBlock[index]);
    return "";
  }

  if (typeof rawBlock === "object") {
    const byNo = rawBlock[item.no];
    if (byNo !== undefined) return sanitizeText(byNo);

    if (rawBlock[item.question] !== undefined) {
      return sanitizeText(rawBlock[item.question]);
    }

    const lowerQuestion = item.question.toLowerCase();

    for (const [key, value] of Object.entries(rawBlock)) {
      const lowerKey = String(key).toLowerCase();
      if (lowerKey.includes(item.no) || lowerKey.includes(lowerQuestion)) {
        return sanitizeText(value);
      }
    }
  }

  return "";
}

function normalizeList(value, fallbackList) {
  const result = [];

  if (Array.isArray(value)) {
    value.forEach((item) => {
      const text = sanitizeText(item);
      if (text) result.push(text);
    });
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => {
      const text = sanitizeText(item);
      if (text) result.push(text);
    });
  } else {
    const text = sanitizeText(value);
    if (text) {
      text
        .split(/\r?\n+/)
        .map((part) =>
          part
            .replace(/^[\-\u2022]\s*/, "")
            .replace(/^\d+[.)]\s*/, "")
            .trim()
        )
        .filter(Boolean)
        .forEach((part) => result.push(part));
    }
  }

  return result.length ? result : fallbackList;
}

function extractFirstJson(content) {
  if (!content) return null;

  if (Array.isArray(content)) {
    const combined = content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object") {
          return part.text || part.content || "";
        }
        return "";
      })
      .join("\n");

    return extractFirstJson(combined);
  }

  const text = String(content);
  const cleaned = text.replace(/```json|```/gi, "").trim();

  const direct = safeParseJson(cleaned);
  if (direct) return direct;

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return safeParseJson(cleaned.slice(start, end + 1));
  }

  return null;
}

function safeParseJson(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function sanitizeText(value) {
  if (value === null || value === undefined) return "";

  if (typeof value === "string") {
    return value.replace(/\s+/g, " ").trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeText(item)).filter(Boolean).join(" ");
  }

  if (typeof value === "object") {
    return sanitizeText(
      value.answer ??
        value.value ??
        value.text ??
        value.content ??
        value.description ??
        value.response ??
        ""
    );
  }

  return "";
}

function sanitizeLongText(value) {
  if (!value) return "";
  return String(value)
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .trim();
}

function pickNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function matchesNo(entry, no) {
  if (!entry) return false;

  if (typeof entry === "object") {
    const candidate = entry.no || entry.code || entry.number;
    return candidate ? String(candidate).trim() === no : false;
  }

  return false;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
    });

    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function collectAllText(draft) {
  try {
    return JSON.stringify(draft || "");
  } catch {
    return String(draft || "");
  }
}