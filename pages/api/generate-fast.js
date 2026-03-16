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
    { no: "1.1", title: "Боль" },
    { no: "1.2", title: "Новый рынок / новая ценность" },
    { no: "1.3", title: "Новые привычки потребления" },
    { no: "1.4", title: "Нарратив" },
    { no: "1.5", title: "Механика обучения" }
  ],
  sensory: [
    { no: "2.1", title: "Визуальный образ" },
    { no: "2.2", title: "Аудиальный образ" },
    { no: "2.3", title: "Обонятельный образ" },
    { no: "2.4", title: "Осязательный образ" },
    { no: "2.5", title: "Вкусовой образ" }
  ],
  branding: [
    { no: "3.1", title: "История и самоидентификация" },
    { no: "3.2", title: "Контекст" },
    { no: "3.3", title: "Ядро бренда" },
    { no: "3.4", title: "Путь клиента" },
    { no: "3.5", title: "Стратегия развития 3–5–10 лет" }
  ],
  marketing: [
    { no: "4.1", title: "Сегменты / позиционирование" },
    { no: "4.2", title: "Линейка продукта" },
    { no: "4.3", title: "Ценообразование" },
    { no: "4.4", title: "Каналы продаж" },
    { no: "4.5", title: "Продвижение" }
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
  "blocks": {
    "cognitive": [
      { "no": "1.1", "title": "Боль", "content": "string" },
      { "no": "1.2", "title": "Новый рынок / новая ценность", "content": "string" },
      { "no": "1.3", "title": "Новые привычки потребления", "content": "string" },
      { "no": "1.4", "title": "Нарратив", "content": "string" },
      { "no": "1.5", "title": "Механика обучения", "content": "string" }
    ],
    "sensory": [
      { "no": "2.1", "title": "Визуальный образ", "content": "string" },
      { "no": "2.2", "title": "Аудиальный образ", "content": "string" },
      { "no": "2.3", "title": "Обонятельный образ", "content": "string" },
      { "no": "2.4", "title": "Осязательный образ", "content": "string" },
      { "no": "2.5", "title": "Вкусовой образ", "content": "string" }
    ],
    "branding": [
      { "no": "3.1", "title": "История и самоидентификация", "content": "string" },
      { "no": "3.2", "title": "Контекст", "content": "string" },
      { "no": "3.3", "title": "Ядро бренда", "content": "string" },
      { "no": "3.4", "title": "Путь клиента", "content": "string" },
      { "no": "3.5", "title": "Стратегия развития 3–5–10 лет", "content": "string" }
    ],
    "marketing": [
      { "no": "4.1", "title": "Сегменты / позиционирование", "content": "string" },
      { "no": "4.2", "title": "Линейка продукта", "content": "string" },
      { "no": "4.3", "title": "Ценообразование", "content": "string" },
      { "no": "4.4", "title": "Каналы продаж", "content": "string" },
      { "no": "4.5", "title": "Продвижение", "content": "string" }
    ]
  },
  "additional": {
    "recipe_technology": "string",
    "form_factor_packaging": "string"
  }
}

ЖЁСТКИЕ ПРАВИЛА:
1. Верни только JSON без markdown и без пояснений.
2. Создай ОДИН новый конкретный продукт, а не перескажи входные данные.
3. Не пересказывай методичку, не описывай структуру задания, не пиши общие правила.
4. Название должно быть брендовым, коротким, русским и без латиницы.
5. category — это товарная категория продукта, а не пользовательский комментарий.
6. innovation и uniqueness — это не общие слова, а конкретная новизна продукта.
7. В каждом блоке должно быть ровно 5 пунктов.
8. Каждый пункт должен быть про конкретный продукт, а не про абстрактную категорию.
9. Внутри текста обязательно должна быть предметность: форма, размер, масса, упаковка, ритуал, сценарий, канал, цена, вкус/запах/тактильность, если это уместно.
10. Не используй пустые фразы вроде: "удобный формат", "понятная выгода", "современный продукт", "подходит многим", если не объяснил предметно.
11. Если продукт несъедобный, в пункте 2.5 опиши не буквальный вкус, а вкусовую метафору или пользовательское ощущение.
12. Если пользователь отключил часть блоков через Нет, сохрани структуру JSON, но делай эти пункты короче.
13. Сначала придумай 3 разные концепции продукта, мысленно выбери лучшую, и только потом верни один финальный сильный вариант.
14. Запрещено брать пользовательские слова и просто делать из них название или продукт.
`;

const BAD_NAME_PATTERNS = [
  "новая полка",
  "полярный продукт",
  "новая привычка",
  "полярный выбор",
  "товар",
  "продукт",
  "яблочно-овсян",
  "полезный",
  "умный"
];

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
  "Ты создаёшь полный когнитивно-сенсорный паспорт нового продукта по логике Полярной Звезды.",
  "Нужно придумать не улучшенную версию существующего товара, а новый рыночно отличимый продуктовый концепт.",
  "Работай как практик: сначала появляется физически понятный продукт, затем его ритуал, бренд, маркетинг и стратегия.",
  "Нельзя пересказывать методичку, вход пользователя или общие маркетинговые слова.",
  "Ориентируйся по глубине, смелости и предметности на сильный эталонный паспорт продукта.",
  OUTPUT_SCHEMA_TEXT
].join("\n\n");

const SYSTEM_PROMPT = [
  EXTERNAL_PROMPT || FALLBACK_SYSTEM_PROMPT,
  REFERENCE_LIBRARY
    ? [
        "НИЖЕ ДАНА БИБЛИОТЕКА РЕФЕРЕНСОВ.",
        "ИСПОЛЬЗУЙ ИХ КАК ОРИЕНТИР ПО ГЛУБИНЕ, ПРЕДМЕТНОСТИ, СИЛЕ ПРОДУКТОВОГО МЫШЛЕНИЯ И УРОВНЮ ДЕТАЛИЗАЦИИ.",
        "НЕ КОПИРУЙ ИХ ДОСЛОВНО.",
        "СОЗДАЙ АБСОЛЮТНО НОВЫЙ ПРОДУКТ, КОТОРОГО НЕТ В ТАКОЙ КОМБИНАЦИИ ФОРМЫ, РИТУАЛА, ЦЕННОСТИ И СЕНСОРНОГО КОДА.",
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
    const firstMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserMessage(input) }
    ];

    const firstDraftRaw = await callTextModel(firstMessages, input.temperature);
    let normalized = normalizeDraft(firstDraftRaw, input);

    if (needsRepair(normalized, input)) {
      const repairMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(input) },
        { role: "assistant", content: JSON.stringify(firstDraftRaw) },
        { role: "user", content: buildRepairMessage(normalized, input) }
      ];

      const repairedRaw = await callTextModel(
        repairMessages,
        clamp(input.temperature + 0.03, 0.2, 0.72)
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

  try {
    const response = await fetch(process.env.QWEN_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.QWEN_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.TEXT_MODEL_NAME,
        messages,
        temperature: clamp(
          Number.isFinite(temperature) ? temperature : DEFAULT_TEMPERATURE,
          0.15,
          0.85
        ),
        top_p: clamp(DEFAULT_TOP_P, 0.1, 1),
        max_tokens: DEFAULT_MAX_TOKENS,
        response_format: { type: "json_object" }
      }),
      signal: controller ? controller.signal : undefined
    });

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
      0.15,
      0.85
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

  if (audienceText) parts.push(audienceText);
  if (age) parts.push(`Возраст: ${age}`);
  if (gender) parts.push(`Пол: ${gender}`);
  if (decision) parts.push(`Кто выбирает/покупает: ${decision}`);

  return parts.join(". ").trim();
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
  if (creativity === "низкая") return 0.32;
  if (creativity === "высокая") return 0.58;
  return 0.42;
}

function normalizeDiagnostics(raw) {
  const result = {};

  if (!raw || typeof raw !== "object") return result;

  const map = {
    pain_refine: [
      "pain_refine",
      "pain",
      "refine_pain",
      "Уточнить/скорректировать формулировку потребительской боли"
    ],
    new_market: [
      "new_market",
      "market",
      "new_value",
      "Показать описание нового рынка/сегмента/ниши и новой ценности"
    ],
    new_habits: [
      "new_habits",
      "habits",
      "Показать новые привычки потребления"
    ],
    narrative: [
      "narrative",
      "narratives",
      "Показать объяснительный нарратив для переобучения потребителей"
    ],
    education: [
      "education",
      "training",
      "Показать механику обучения потребителей"
    ],
    visual: [
      "visual",
      "visual_image",
      "Показать уникальный визуальный образ"
    ],
    audio: [
      "audio",
      "sound",
      "Показать уникальный аудиальный образ"
    ],
    smell: [
      "smell",
      "odor",
      "Показать уникальный обонятельный образ"
    ],
    touch: [
      "touch",
      "tactile",
      "Показать уникальный осязательный образ"
    ],
    taste: [
      "taste",
      "flavor",
      "Показать уникальный вкусовой образ"
    ],
    story: [
      "story",
      "identity",
      "Показать, как потребитель улучшает свой набор историй за счет бренда"
    ],
    context: [
      "context",
      "trends",
      "Показать контекст: какие внешние условия/тренды помогают, а какие мешают"
    ],
    brand_core: [
      "brand_core",
      "core",
      "Показать сильное ядро бренда: название, логотип, слоган, идея key visual"
    ],
    customer_path: [
      "customer_path",
      "path",
      "Показать уникальный путь клиента и уникальные действия в важных точках пути"
    ],
    strategy: [
      "strategy",
      "brand_strategy",
      "Показать развитие стратегии бренда на 3–5–10 лет"
    ],
    segments: [
      "segments",
      "segmentation",
      "Показать ключевые сегменты и позиционирование относительно конкурентов"
    ],
    product_line: [
      "product_line",
      "line",
      "Показать идею базового продукта и развитие линеек"
    ],
    pricing: [
      "pricing",
      "price",
      "Показать ценообразование продукта и линеек"
    ],
    channels: [
      "channels",
      "sales_channels",
      "Показать развитие каналов продаж"
    ],
    promotion: [
      "promotion",
      "marketing",
      "Показать систему продвижения"
    ],
    tech: [
      "tech",
      "recipe",
      "composition",
      "Показать предложения по рецептуре, технологии и составу"
    ],
    packaging: [
      "packaging",
      "form_factor",
      "Показать предложения по форм-факторам и упаковке"
    ]
  };

  const entries = Object.entries(raw);

  Object.entries(map).forEach(([canonicalKey, aliases]) => {
    for (const [key, value] of entries) {
      if (
        aliases.includes(key) ||
        aliases.some(
          (alias) =>
            String(key).toLowerCase() === String(alias).toLowerCase()
        )
      ) {
        result[canonicalKey] = normalizeYesNo(value);
        break;
      }
    }
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
  const yesBlocks = Object.entries(input.diagnostics)
    .filter(([_, value]) => value === "yes")
    .map(([key]) => key);

  const noBlocks = Object.entries(input.diagnostics)
    .filter(([_, value]) => value === "no")
    .map(([key]) => key);

  const parts = [
    "СОЗДАЙ ОДИН НОВЫЙ ПРОДУКТ.",
    "НЕ ПЕРЕСКАЗЫВАЙ ВХОДНЫЕ ДАННЫЕ.",
    "НЕ ПЕРЕСКАЗЫВАЙ МЕТОДИЧКУ.",
    "НЕ ДЕЛАЙ ОБЩИЕ СЛОВА ВМЕСТО ПРОДУКТА.",
    "",
    "ВХОДНЫЕ ДАННЫЕ:",
    `1. Категория / ниша: ${input.category || "-"}`,
    `2. Хотелка / гипотеза: ${input.wish || "-"}`,
    `3. Потребительская боль: ${input.pain || "-"}`,
    `4. Целевая аудитория: ${input.audience || "-"}`,
    `5. Дополнительный комментарий: ${input.comment || "-"}`,
    input.name
      ? `6. Пользователь указал название: ${input.name}`
      : "6. Название не указано",
    `7. Уровень креативности: ${input.creativity}`,
    "",
    "КРИТИЧЕСКИЕ ТРЕБОВАНИЯ:",
    "- сначала придумай 3 разные продуктовые концепции внутри этой задачи;",
    "- затем выбери только одну лучшую;",
    "- наружу покажи только один финальный вариант;",
    "- продукт должен быть физическим, понятным и новым;",
    "- нельзя брать слова пользователя и просто превращать их в название;",
    "- название должно звучать как бренд, а не как описание состава;",
    "- продукт должен ощущаться как новый подрынок, новый ритуал или новая товарная логика;",
    "- в каждом блоке пиши только про конкретный продукт;",
    "- не пиши 'должен быть', опиши, какой продукт уже получился;",
    "- если идея банальная, усили её и придумай сильнее;"
  ];

  if (yesBlocks.length > 0) {
    parts.push(
      "",
      `ОСОБЕННО ПОДРОБНО РАСКРОЙ: ${yesBlocks.join(", ")}`
    );
  }

  if (noBlocks.length > 0) {
    parts.push(`КОРОЧЕ МОЖНО СДЕЛАТЬ: ${noBlocks.join(", ")}`);
  }

  parts.push(
    "",
    "ЗАПРЕТЫ:",
    '- не давай названия вроде "Новая полка", "Умный ...", "Полезный ...", "Яблочно-..." как механическую склейку;',
    "- не подменяй товар пользовательской фразой;",
    "- не описывай просто категорию;",
    "- не пиши мета-рассуждения;",
    "",
    "ВЫХОД:",
    "- верни только JSON;",
    "- не пиши markdown;",
    "- не пиши пояснения вне JSON;"
  );

  return parts.join("\n");
}

function buildRepairMessage(draft, input) {
  const problems = collectProblems(draft, input);

  return [
    "Исправь предыдущий JSON.",
    "Проблемы, которые нужно устранить:",
    ...problems.map((p, idx) => `${idx + 1}. ${p}`),
    "",
    "Сделай новый JSON целиком с нуля.",
    "Верни только JSON."
  ].join("\n");
}

function collectProblems(draft, input) {
  const problems = [];

  const name = sanitizeText(draft?.header?.name).toLowerCase();
  const category = sanitizeText(draft?.header?.category).toLowerCase();
  const innovation = sanitizeText(draft?.header?.innovation).toLowerCase();
  const uniqueness = sanitizeText(draft?.header?.uniqueness).toLowerCase();

  if (!name || isWeakName(name)) {
    problems.push("Название слабое, служебное или выглядит как механическая склейка слов.");
  }

  if (!category || looksLikeUserComment(category, input)) {
    problems.push("Поле category заполнено не товарной категорией, а входной фразой пользователя.");
  }

  if (!innovation || innovation.length < 30 || /новый продукт|новая ценность|современный/i.test(innovation)) {
    problems.push("Поле innovation слишком общее.");
  }

  if (!uniqueness || uniqueness.length < 30 || /новый продукт|новая ценность|современный/i.test(uniqueness)) {
    problems.push("Поле uniqueness слишком общее.");
  }

  if (hasTooManyGenericBlocks(draft)) {
    problems.push("В блоках слишком много шаблонного текста вместо конкретного нового продукта.");
  }

  if (repeatsInputTooDirectly(draft, input)) {
    problems.push("Ответ слишком прямо повторяет входные слова пользователя вместо синтеза нового продукта.");
  }

  return problems.length
    ? problems
    : ["Ответ недостаточно сильный и выглядит как пересказ входа."];
}

function needsRepair(draft, input) {
  return collectProblems(draft, input).length > 0;
}

function isWeakName(name) {
  return BAD_NAME_PATTERNS.some((bad) => name.includes(bad));
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

function hasTooManyGenericBlocks(draft) {
  const texts = [];

  Object.values(draft?.blocks || {}).forEach((block) => {
    if (Array.isArray(block)) {
      block.forEach((item) =>
        texts.push(sanitizeText(item?.content || item?.answer).toLowerCase())
      );
    }
  });

  const weakCount = texts.filter((text) => {
    return (
      text.includes("продукт должен") ||
      text.includes("новая ценность") ||
      text.includes("современный") ||
      text.includes("понятный") ||
      text.includes("удобный формат") ||
      text.includes("может быть")
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
      fallback.header.innovation
    ),
    uniqueness: pickNonEmpty(
      sanitizeText(rawDraft.header?.uniqueness),
      sanitizeText(rawDraft.uniqueness),
      fallback.header.uniqueness
    )
  };

  const blocks = {};
  Object.entries(BLOCK_SCHEMAS).forEach(([key, schema]) => {
    const rawBlock = extractBlock(rawDraft, key);
    blocks[key] = schema.map((item, index) => {
      const fallbackItem = fallback.blocks[key][index];
      return {
        no: item.no,
        title: item.title,
        content: pickNonEmpty(
          extractContent(rawBlock, item, index),
          fallbackItem.content
        )
      };
    });
  });

  const additional = {
    recipe_technology: pickNonEmpty(
      sanitizeText(rawDraft.additional?.recipe_technology),
      sanitizeText(rawDraft.recipe_technology),
      sanitizeText(rawDraft.tech),
      fallback.additional.recipe_technology
    ),
    form_factor_packaging: pickNonEmpty(
      sanitizeText(rawDraft.additional?.form_factor_packaging),
      sanitizeText(rawDraft.form_factor_packaging),
      sanitizeText(rawDraft.packaging),
      fallback.additional.form_factor_packaging
    )
  };

  return {
    header,
    blocks,
    additional
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
    "Существующие решения закрывают задачу неудобно, слишком скучно или не полностью"
  );
  const innovation = buildFallbackInnovation(category, input);
  const uniqueness = buildFallbackUniqueness(category, input);
  const descriptor = guessDescriptor(category, input);

  const blocks = {
    cognitive: [
      {
        no: "1.1",
        title: "Боль",
        content: `Глубинная боль не в отсутствии самого товара, а в том, что привычные решения в категории "${category}" не дают человеку нужного сценария: они либо слишком неудобны, либо не встроены в реальную рутину, либо не создают ощущения, что задача решена без компромисса.`
      },
      {
        no: "1.2",
        title: "Новый рынок / новая ценность",
        content: `Продукт открывает подкатегорию внутри "${category}": человек покупает не просто товар, а более точный ритуал использования, более сильное ощущение контроля и более заметную потребительскую логику.`
      },
      {
        no: "1.3",
        title: "Новые привычки потребления",
        content: descriptor.habit
      },
      {
        no: "1.4",
        title: "Нарратив",
        content: `Нарратив строится так: старые решения закрывали задачу частично, а ${name} делает саму сцену использования проще, приятнее и более современной. Это не просто новый вкус или форма, а новая модель поведения внутри категории.`
      },
      {
        no: "1.5",
        title: "Механика обучения",
        content: `Обучение идёт через упаковку, фронтальное обещание, короткое объяснение ритуала на первом касании, визуальные подсказки и демонстрацию в месте, где боль возникает в реальной жизни.`
      }
    ],
    sensory: [
      {
        no: "2.1",
        title: "Визуальный образ",
        content: descriptor.visual
      },
      {
        no: "2.2",
        title: "Аудиальный образ",
        content: descriptor.audio
      },
      {
        no: "2.3",
        title: "Обонятельный образ",
        content: descriptor.smell
      },
      {
        no: "2.4",
        title: "Осязательный образ",
        content: descriptor.touch
      },
      {
        no: "2.5",
        title: "Вкусовой образ",
        content: descriptor.taste
      }
    ],
    branding: [
      {
        no: "3.1",
        title: "История и самоидентификация",
        content: `${name} помогает человеку ощущать себя не случайным покупателем категории, а человеком, который нашёл более умный и более собранный способ решать свою задачу в повседневной жизни.`
      },
      {
        no: "3.2",
        title: "Контекст",
        content: `Помогают тренды на понятные продуктовые ритуалы, более осознанный выбор и готовность пробовать новые форматы. Мешают недоверие к непривычным решениям, визуальный шум категории и риск, что новизна будет плохо объяснена на первой секунде контакта.`
      },
      {
        no: "3.3",
        title: "Ядро бренда",
        content: `Название — ${name}. Бренд-код строится вокруг одного сильного образа: ${descriptor.brandCore}. Слоган должен обещать не абстрактную пользу, а новый способ действия внутри категории.`
      },
      {
        no: "3.4",
        title: "Путь клиента",
        content: `Сначала человек замечает необычную форму или обещание, затем быстро понимает сцену использования, пробует продукт в своём реальном контексте, встраивает его в рутину и только после этого начинает рекомендовать другим как находку, а не как очередную новинку.`
      },
      {
        no: "3.5",
        title: "Стратегия развития 3–5–10 лет",
        content: `На 3 года бренд закрепляет базовый сценарий и главный SKU. На 5 лет расширяется в линейку по ситуациям использования. На 10 лет превращается в устойчивый продуктовый мир с несколькими форматами и узнаваемым ритуалом потребления.`
      }
    ],
    marketing: [
      {
        no: "4.1",
        title: "Сегменты / позиционирование",
        content: `Главный сегмент — люди, у которых боль возникает регулярно и которые готовы платить за более точный и более удобный сценарий. Позиционирование строится не против всех конкурентов сразу, а против старого неудобного поведения внутри категории.`
      },
      {
        no: "4.2",
        title: "Линейка продукта",
        content: `Первый SKU должен быть самым понятным и самым сильным. Затем линейка расширяется через вкусы, размеры, сценарии использования и соседние форматы, но без потери базовой логики продукта.`
      },
      {
        no: "4.3",
        title: "Ценообразование",
        content: `Цена должна считываться как оправданная за счёт нового сценария, лучшей предметности, заметной упаковки и более сильного первого опыта. Человек платит не только за состав или материал, а за новую модель действия.`
      },
      {
        no: "4.4",
        title: "Каналы продаж",
        content: `Старт лучше делать там, где сама боль и сцена использования возникают наиболее естественно: профильная розница, точечные партнёрские каналы, DTC и понятные места первой пробы. Затем — маркетплейсы и масштабирование в массовые каналы.`
      },
      {
        no: "4.5",
        title: "Продвижение",
        content: `Продвижение должно показывать не общий бренд, а сам ритуал. Лучше всего работают демонстрация использования, объяснение новой логики продукта, микроинфлюенсеры и контент, где человек за секунды понимает, почему это не очередной аналог.`
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
    blocks,
    additional: {
      recipe_technology: descriptor.recipeTechnology,
      form_factor_packaging: descriptor.packaging
    }
  };
}

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
  if (preferred && !/[A-Za-z]/.test(preferred) && /[А-Яа-яЁё]/.test(preferred)) {
    return preferred;
  }

  const text = `${category} ${input.wish} ${input.comment}`.toLowerCase();

  if (/(батон|спорт|трен|зал|энерг)/.test(text)) return "Сетка";
  if (/(школ|завтрак|дет)/.test(text)) return "Утрянка";
  if (/(паштет|намаз|паста)/.test(text)) return "Мазок";
  if (/(напит)/.test(text)) return "Импульс";

  return "Контур";
}

function buildFallbackInnovation(category, input) {
  const text = `${category} ${input.wish} ${input.comment}`.toLowerCase();

  if (/(батон|спорт|трен|зал|энерг)/.test(text)) {
    return "Продукт превращает обычный спортивный перекус в поэтапный ритуал внутри самой тренировки, где еда работает как инструмент управления темпом нагрузки.";
  }
  if (/(школ|завтрак|дет)/.test(text)) {
    return "Продукт создаёт отдельный формат школьного завтрака без готовки, ложки и борьбы за утренний сценарий дома.";
  }

  return `Продукт создаёт внутри категории "${category}" новый сценарий потребления, в котором форма, ритуал и бренд дают отдельную оплачиваемую ценность.`;
}

function buildFallbackUniqueness(category, input) {
  const text = `${category} ${input.wish} ${input.comment}`.toLowerCase();

  if (/(батон|спорт|трен|зал|энерг)/.test(text)) {
    return "Уникальность в том, что продукт едят не просто до или после нагрузки, а по фазам самой тренировки, как видимый и понятный инструмент тренировочного ритма.";
  }
  if (/(школ|завтрак|дет)/.test(text)) {
    return "Уникальность в том, что это не сладость и не каша, а отдельный физический формат готового школьного завтрака, который можно дать ребёнку сразу без подготовки.";
  }

  return `Уникальность строится на сочетании нового форм-фактора, ритуала использования и сильного брендового кода внутри категории "${category}".`;
}

function guessDescriptor(category, input) {
  const text = `${category} ${input.wish} ${input.comment}`.toLowerCase();

  if (/(батон|спорт|зал|трен|энерг)/.test(text)) {
    return {
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
        "ритм, сетка, фазы нагрузки, дисциплина и собранность",
      recipeTechnology:
        "Основа — злаковая матрица с низкой липкостью, ореховая или зерновая связка, умеренно быстрые и медленные углеводы, возможный электролитный или кофеиновый акцент в зависимости от SKU. Рецептура должна выдерживать поэтапное употребление без крошения в пыль и без грязных рук.",
      packaging:
        "Главный форм-фактор — батончик 48–52 г, разделённый на 4 функциональные секции. Упаковка — индивидуальная, со ступенчатым вскрытием и крупной визуальной схемой: как, когда и зачем использовать каждую часть."
    };
  }

  if (/(школ|завтрак|дет)/.test(text)) {
    return {
      habit:
        "Продукт внедряет новый утренний ритуал: вместо ложки, кастрюли или споров дома родитель даёт ребёнку готовый завтрак в руки или кладёт его в рюкзак как первую часть дня.",
      visual:
        "Визуально продукт должен быть дружелюбным, но не инфантильным: понятная форма бруска или пары модулей, яркая упаковка с крупной иконкой пользы и сцены дороги в школу.",
      audio:
        "Аудиальный образ — мягкий, чистый звук вскрытия и лёгкий хруст слоёв, чтобы продукт считывался как готовая еда, а не как конфета.",
      smell:
        "Запах — тёплый, домашний, зерновой, с фруктовой или молочной нотой, создающий ощущение полноценного завтрака без необходимости готовить.",
      touch:
        "Тактильно продукт должен быть аккуратным, не липким, удобным для детской руки, а упаковка — открываться быстро и без сильного усилия.",
      taste:
        "Вкус должен быть мягким, знакомым и спокойным: яблоко-корица, банан-злак, молочный злак с фруктовой нотой, без ощущения десерта и без приторности.",
      brandCore:
        "спокойное утро, готовность, первый шаг дня, родительский контроль без утренней борьбы",
      recipeTechnology:
        "Формула должна сочетать зерновую базу, молочный или растительный слой, связующую структуру и умеренную сладость. Технология обязана держать форму без ложки и без разогрева, при этом не превращая продукт в обычный десертный батончик.",
      packaging:
        "Главный форм-фактор — мягкий брусок или двойной модуль 55–65 г. Упаковка — яркая, индивидуальная, с фронтальным объяснением сценария: готовый завтрак без готовки, который можно дать сразу в руку или положить в рюкзак."
    };
  }

  return {
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
      "Вкусовой образ или вкусовая метафора должны подтверждать логику продукта и ощущение его новизны.",
      brandCore:
      "новый ритуал, предметность, ясность сценария, сильный маркер новизны",
      recipeTechnology:
      "Рецептура, материалы или конструкция должны быть простроены вокруг реальной сцены использования и возможности быстро сделать MVP без фальшивой инновационности.",
      packaging:
      "Форм-фактор и упаковка должны быстро объяснять сцену использования, главный маркер новизны и причину, по которой продукт стоит попробовать."
  };
}

function forceName(name, fallback) {
  const text = sanitizeText(name);
  if (!text) return fallback;
  if (/[A-Za-z]/.test(text)) return fallback;
  if (!/[А-Яа-яЁё]/.test(text)) return fallback;
  if (isWeakName(text.toLowerCase())) return fallback;
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

function extractContent(rawBlock, item, index) {
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

    if (rawBlock[item.title] !== undefined) {
      return sanitizeText(rawBlock[item.title]);
    }

    for (const [key, value] of Object.entries(rawBlock)) {
      const lowerKey = String(key).toLowerCase();
      if (
        lowerKey.includes(item.no.toLowerCase()) ||
        lowerKey.includes(item.title.toLowerCase())
      ) {
        return sanitizeText(value);
      }
    }
  }

  return "";
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
      value.content ??
        value.answer ??
        value.value ??
        value.text ??
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