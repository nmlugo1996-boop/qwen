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
        "Изменение модели потребления: какой новый рынок открываем? Какую новую или дополнительную монетизируемую ценность предлагаем?"
    },
    {
      no: "1.2",
      question:
        "Изменение технологии потребления: какие новые привычки или ритуалы потребления внедряем?"
    },
    {
      no: "1.3",
      question:
        "Нарративы: как объясняем, что инновация нужна, полезна и выгодна?"
    },
    {
      no: "1.4",
      question:
        "Желаемая когнитивная модель: мысли, ощущения и чувства, поведение"
    },
    {
      no: "1.5",
      question:
        "Какие способы, каналы и приёмы обучения потребителей используем?"
    }
  ],
  sensory: [
    { no: "2.1", question: "Сильный визуальный образ" },
    { no: "2.2", question: "Сильный аудиальный образ" },
    { no: "2.3", question: "Сильный обонятельный образ" },
    { no: "2.4", question: "Сильный осязательный образ" },
    { no: "2.5", question: "Сильный вкусовой образ" }
  ],
  branding: [
    {
      no: "3.1",
      question:
        "Сильная история и обещание бренда: как улучшаем личную историю и самоидентификацию потребителя?"
    },
    {
      no: "3.2",
      question:
        "Контекст: какой контекст поможет развить бренд? Какой помешает?"
    },
    {
      no: "3.3",
      question:
        "Сильное ядро бренда: название, логотип, слоган, идея key visual"
    },
    {
      no: "3.4",
      question:
        "Уникальный путь клиента с продуктом и брендом"
    },
    {
      no: "3.5",
      question:
        "Стратегия развития бренда на 3–5–10 лет"
    }
  ],
  marketing: [
    {
      no: "4.1",
      question:
        "Сегментация и позиционирование относительно конкурентов"
    },
    {
      no: "4.2",
      question:
        "Описание базового продукта и его развитие во времени"
    },
    {
      no: "4.3",
      question:
        "Развитие ценообразования"
    },
    {
      no: "4.4",
      question:
        "Развитие каналов сбыта"
    },
    {
      no: "4.5",
      question:
        "Продвижение"
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
5. product_core.physical_form обязан объяснять: что это за физический объект, масса/объём/размер, как открывается, как используется.
6. product_core.appearance обязан объяснять: как выглядит сам продукт и упаковка.
7. product_core.composition обязан объяснять: состав, технологию или конструкцию, а не общие слова.
8. product_core.usage обязан описывать реальный жизненный сценарий использования.
9. innovation и uniqueness должны быть конкретными и не общими.
10. Во всех 4 блоках должно быть ровно по 5 объектов.
11. Если продукт несъедобный, в пункте 2.5 дай не буквальный вкус, а «вкусовую метафору / пользовательское ощущение».
12. Запрещены пустые формулировки вроде: "удобный формат", "понятная выгода", "современный продукт", "реальный товар", "подходит многим", если это не расшифровано предметно.
13. Если пользователь отключил какой-то подпункт через Нет, всё равно сохрани структуру JSON, но сделай ответ короче и не перегружай этот подпункт.
14. Если данных мало, делай разумные предположения, но не пиши слово "предположение" в JSON.
`;

const BAD_NAME_PATTERNS = [
  "новая полка",
  "полярный продукт",
  "новая привычка",
  "полярный выбор",
  "продукт",
  "товар"
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
  "Ты создаёшь КОГНИТИВНО-СЕНСОРНЫЙ ПАСПОРТ нового продукта по логике Полярной Звезды.",
  "Нужно придумать не улучшенную версию существующего товара, а новый, рыночно отличимый продуктовый концепт.",
  "Продукт должен быть физически понятным, коммерчески объяснимым и достаточно новым, чтобы ощущаться как отдельный подсегмент или новая подкатегория.",
  "Работай как практик: упаковка, состав, сценарий, ритуал, каналы, цена и бренд должны быть согласованы между собой.",
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
        {
          role: "assistant",
          content: JSON.stringify(firstDraftRaw)
        },
        {
          role: "user",
          content: buildRepairMessage(normalized, input)
        }
      ];

      const repairedRaw = await callTextModel(
        repairMessages,
        clamp(input.temperature + 0.03, 0.2, 0.7)
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
  if (decision) parts.push(`Модель выбора/покупки: ${decision}`);

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
        aliases.some((alias) => String(key).toLowerCase() === String(alias).toLowerCase())
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
    "ВХОДНЫЕ ДАННЫЕ ДЛЯ СОЗДАНИЯ НОВОГО ПРОДУКТА:",
    `1. Отрасль/ниша: ${input.category || "-"}`,
    `2. Хотелка / гипотеза продукта: ${input.wish || "-"}`,
    `3. Потребительская боль: ${input.pain || "-"}`,
    `4. Целевая аудитория и модель принятия решения: ${input.audience || "-"}`,
    `5. Дополнительные пожелания / факторы: ${input.comment || "-"}`,
    input.name
      ? `6. Предпочитаемое название от пользователя: ${input.name}`
      : "6. Название не задано: придумай сильное русское название сам",
    `7. Уровень креативности: ${input.creativity}`,
    `8. Температура генерации: ${input.temperature}`,
    "",
    "КРИТИЧЕСКОЕ ЗАДАНИЕ:",
    "- придумай не банальную вариацию существующего SKU, а новый рыночно отличимый продукт;",
    "- продукт должен ощущаться как новый подсегмент, новый сценарий потребления или новая комбинация пользы, формы и ритуала;",
    "- нельзя подменять продукт пользовательским комментарием или описанием боли;",
    "- сначала выбери, ЧТО ЭТО ЗА ФИЗИЧЕСКИЙ ПРОДУКТ;",
    "- затем сделай его брендом и паспортом;",
    "- ответ должен быть ближе по силе к эталону уровня сильного КСП, а не к общим фразам;",
    "- если идея получается банальной, усили её через новый ритуал, дополнительную монетизируемую ценность, сенсорный код и путь клиента;"
  ];

  if (yesBlocks.length > 0) {
    parts.push(
      "",
      `БЛОКИ, КОТОРЫЕ ПОЛЬЗОВАТЕЛЬ ХОЧЕТ РАСКРЫТЬ ОСОБЕННО ПОДРОБНО: ${yesBlocks.join(", ")}`
    );
  }

  if (noBlocks.length > 0) {
    parts.push(
      `БЛОКИ, КОТОРЫЕ ПОЛЬЗОВАТЕЛЬ НЕ ПРОСИЛ РАСКРЫВАТЬ СЛИШКОМ ПОДРОБНО: ${noBlocks.join(", ")}`
    );
  }

  parts.push(
    "",
    "ОСОБЕННО ВАЖНО ДЛЯ product_core:",
    "- one_liner: 1–2 предложения, что это за продукт и в чём его суть;",
    "- physical_form: обязательно укажи формат, массу/объём/размер, конструкцию, способ открытия;",
    "- appearance: опиши внешний вид продукта и упаковки;",
    "- composition: дай состав, рецептуру, технологию или принцип конструкции;",
    "- usage: опиши реальную сцену использования;",
    "- novelty_mechanism: объясни, почему это новый продукт, а не просто улучшение;",
    "- why_people_will_try_it: объясни, почему человек захочет попробовать;",
    "",
    "ОСОБЕННО ВАЖНО ДЛЯ header:",
    "- category должна быть товарной категорией;",
    "- name должен быть брендовым;",
    "- audience должна быть внятной, а не мусорным списком;",
    "- pain должен быть глубинной болью;",
    "- innovation и uniqueness должны быть конкретными, не абстрактными;",
    "",
    "ЗАПРЕЩЕНО:",
    '- давать названия типа "Новая полка", "Полярный продукт", "Новая привычка";',
    '- писать вместо физической формы слова "реальный товар", "удобный продукт", "конкретный объект";',
    "- делать абстрактный ответ без формы, упаковки, сценария и ритуала;",
    "- возвращать воду вместо предметного нового продукта;"
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
    "Сделай новый JSON целиком с нуля, не патч.",
    "Верни только JSON."
  ].join("\n");
}

function collectProblems(draft, input) {
  const problems = [];

  const name = sanitizeText(draft?.header?.name).toLowerCase();
  const category = sanitizeText(draft?.header?.category).toLowerCase();
  const audience = sanitizeText(draft?.header?.audience).toLowerCase();
  const physical = sanitizeText(draft?.product_core?.physical_form).toLowerCase();
  const appearance = sanitizeText(draft?.product_core?.appearance).toLowerCase();
  const composition = sanitizeText(draft?.product_core?.composition).toLowerCase();
  const usage = sanitizeText(draft?.product_core?.usage).toLowerCase();

  if (!name || isWeakName(name)) {
    problems.push("Название слишком слабое, служебное или не брендовое.");
  }

  if (!category || looksLikeUserComment(category, input)) {
    problems.push("Поле category заполнено не товарной категорией, а пользовательской фразой или комментарием.");
  }

  if (!audience || audience.length < 10 || /неважно|любые|все/.test(audience)) {
    problems.push("Поле audience слишком слабое, мусорное или не сегментированное.");
  }

  if (isWeakPhysical(physical)) {
    problems.push("Поле product_core.physical_form не объясняет, что это за физический продукт.");
  }

  if (isWeakGeneric(appearance)) {
    problems.push("Поле product_core.appearance слишком общее.");
  }

  if (isWeakGeneric(composition)) {
    problems.push("Поле product_core.composition слишком общее.");
  }

  if (isWeakGeneric(usage)) {
    problems.push("Поле product_core.usage слишком общее.");
  }

  if (hasTooManyGenericBlocks(draft)) {
    problems.push("Слишком много шаблонных формулировок в блоках, нужен конкретный продукт, а не универсальный шаблон.");
  }

  return problems.length
    ? problems
    : ["Ответ недостаточно конкретный и выглядит как шаблон, а не как новый продукт."];
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
  if (category.includes("хочу ") || category.includes("для ") && category.length > 40) return true;

  return false;
}

function isWeakPhysical(text) {
  if (!text) return true;

  const bad = [
    "реальный товар",
    "конкретный продукт",
    "физически конкретный",
    "понятный объект",
    "должен быть",
    "формат должен быть"
  ];

  if (bad.some((x) => text.includes(x))) return true;
  if (!/\d/.test(text) && !/(г|гр|мл|мм|см|шт|сегмент|порци|батон|пачк|стакан|банка|тюбик|дойпак|брикет|капсул|кусоч|слайс|ролл|куб)/.test(text)) {
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
      block.forEach((item) => texts.push(sanitizeText(item?.answer).toLowerCase()));
    }
  });

  const weakCount = texts.filter((text) => {
    return (
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
      input,
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

  const productCore = normalizeProductCore(rawDraft.product_core, fallback, input);
  const tech = normalizeList(rawDraft.tech, fallback.tech).slice(0, 3);
  const packaging = normalizeList(rawDraft.packaging, fallback.packaging).slice(0, 3);
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

function normalizeProductCore(rawCore, fallback, input) {
  const fb = fallback.product_core;

  const physical = pickNonEmpty(
    sanitizeText(rawCore?.physical_form),
    fb.physical_form
  );

  return {
    one_liner: pickNonEmpty(sanitizeText(rawCore?.one_liner), fb.one_liner),
    physical_form: isWeakPhysical(physical) ? fb.physical_form : physical,
    appearance: pickNonEmpty(
      sanitizeText(rawCore?.appearance),
      fb.appearance
    ),
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
  const innovation = pickNonEmpty(
    input.wish,
    `Новый продукт в категории "${category}" создаёт более сильный сценарий потребления и заметную дополнительную ценность`
  );

  const productDescriptor = guessPhysicalDescriptor(category, input);

  const fallbackAnswers = {
    cognitive: [
      `Варианты дополнительной или альтернативной ценности: 1) продукт продаёт не только базовую функцию, но и более умный способ решать боль "${pain}" 2) он создаёт новый оплачиваемый сценарий внутри категории "${category}" 3) он даёт человеку ощущение контроля, статуса или собранности, за которое можно платить больше. Также обратите внимание на кейсы брендов: 1) Apple 2) White Claw 3) Red Bull.`,
      `Варианты новых привычек потребления: 1) использовать продукт в конкретной повторяемой жизненной ситуации 2) встроить его в новый ритуал вместо старого неудобного решения 3) делать потребление демонстративным и объяснимым другим 4) использовать продукт как понятный маркер новой привычки. Также обратите внимание на кейсы брендов: 1) Orbit 2) KitKat 3) Red Bull.`,
      `Варианты нарратива: 1) «Когда вы используете ${name}, то получаете не просто базовую пользу, а более собранный и удобный способ закрыть свою задачу» 2) «Когда вы выбираете ${name}, то не идёте на старый компромисс и чувствуете, что нашли более умное решение» 3) «Когда вы встраиваете ${name} в свою рутину, то делаете привычную ситуацию проще, приятнее и современнее». Также обратите внимание на кейсы брендов: 1) Calgon 2) Activia 3) Nike.`,
      `1) Мысли: я выбрал более умный и современный способ закрыть свою задачу. 2) Чувства: контроль, спокойствие, уверенность, удовольствие от правильного выбора. 3) Действия: повторная покупка, интеграция в рутину, рекомендации другим.`,
      `Варианты обучения и каналов: 1) короткая инструкция на упаковке 2) объясняющий ролик со сценой использования 3) обучающий контент в точке продажи 4) работа с лидерами мнений 5) простая механика первого теста. Также обратите внимание на кейсы брендов: 1) ВкусВилл 2) Горячая штучка 3) Lays.`
    ],
    sensory: [
      `Варианты сильного визуального образа: 1) заметная форма ${productDescriptor.shape} 2) упаковка с одним главным маркером новизны 3) цветовой код, который делает продукт узнаваемым с расстояния. Также обратите внимание на кейсы брендов: 1) Matsu 2) Вязанка 3) RXBAR.`,
      `Варианты сильного аудиального образа: 1) характерный звук открытия упаковки 2) узнаваемый звук контакта с продуктом 3) короткий звуковой код в роликах. Также обратите внимание на кейсы брендов: 1) KitKat 2) McDonald's 3) Папа может.`,
      `Варианты сильного обонятельного образа: 1) понятный аромат, связанный с пользой продукта 2) запах при открытии, усиливающий ожидание 3) запоминаемый ароматический шлейф. Также обратите внимание на кейсы брендов: 1) Камамбер 2) Lush 3) ароматизированные напитки.`,
      `Варианты сильного осязательного образа: 1) тактильно приятная упаковка 2) запоминаемая фактура самого продукта 3) отдельный ритуал открытия или разделения. Также обратите внимание на кейсы брендов: 1) Toblerone 2) шампанское 3) безоболочечные колбасы.`,
      `Варианты сильного вкусового образа: 1) базовый вкусовой профиль, связанный с категорией 2) контрастный акцент, который делает вкус новым 3) узнаваемое послевкусие. Также обратите внимание на кейсы брендов: 1) Coca-Cola 2) Pringles 3) Wrigley Spearmint.`
    ],
    branding: [
      `Сильная история 1: ${name} помогает человеку ощущать себя более собранной и современной версией себя. Сильная история 2: ${name} — это не просто продукт, а знак, что человек умеет выбирать более умные решения. Также обратите внимание на кейсы брендов: 1) Apple 2) Nike 3) Red Bull.`,
      `Благоприятные тренды/контекст: интерес к новым форматам, к понятным ритуалам, к продуктам с сильной идеей и визуальным кодом. Неблагоприятные тренды/контекст: перегретость рынка, ценовое давление, недоверие к странным новинкам. Также обратите внимание на кейсы брендов: 1) Oatly 2) White Claw 3) ВкусВилл.`,
      `Вариант ядра бренда 1: название — ${name}, идея логотипа — простой сильный знак, связанный со сценарием использования, обещание — короткая формула новой ценности. Вариант ядра бренда 2: название — ${buildAlternateName(category)}, идея логотипа — символ действия или ритуала, обещание — слоган про новый способ решать задачу. Также обратите внимание на кейсы брендов: 1) Nike 2) Apple 3) RXBAR.`,
      `Вариант пути клиента (описание): Шаг 1: замечает необычный продукт. Шаг 2: быстро понимает, в чём новизна. Шаг 3: пробует без высокого барьера. Шаг 4: встраивает в рутину. Шаг 5: начинает рекомендовать. Также обратите внимание на кейсы брендов: 1) IKEA 2) ВкусВилл 3) Red Bull.`,
      `Вариант стратегии бренда: 1 год — запуск базового SKU и объяснение сценария. 3 года — расширение линейки. 5 лет — выход в соседние сценарии использования. 10 лет — превращение в заметную категорию или субкатегорию. Также обратите внимание на кейсы брендов: 1) Red Bull 2) Nike 3) Oatly.`
    ],
    marketing: [
      `Сегмент → Потребность → Канал привлечения → Триггер покупки: 1) базовый сегмент — снять боль быстро и понятно — digital и офлайн-точка — обещание нового сценария 2) более вовлечённый сегмент — получить не только пользу, но и ритуал — комьюнити и рекомендации — понятная новизна 3) импульсный сегмент — попробовать яркую новинку — полка и контент — необычная форма и объяснимость.`,
      `Базовый продукт: ${productDescriptor.description}. Развитие: сезонные версии, функциональные добавки, лимитки, соседние форматы.`,
      `Базовая цена: средне-премиальная относительно категории. Обоснование: человек платит не только за ингредиенты, но и за новый сценарий, упаковку, ритуал и ощущение продуманности. Механики лояльности: наборы, подписка, лимитки.`,
      `Старт: DTC и точечные партнёрские каналы. Рост: маркетплейсы, профильная розница, коллаборации. Масштаб: федеральные сети и специальные зоны продаж.`,
      `Тактика 1: демонстрация нового ритуала. Тактика 2: UGC с реальной сценой использования. Тактика 3: микроинфлюенсеры. Тактика 4: пробные наборы. Тактика 5: объясняющий контент в точке продажи. KPI безбюджетного продвижения: охват, доля проб, доля повторной покупки, доля UGC.`
    ]
  };

  const blocks = {};
  Object.entries(BLOCK_SCHEMAS).forEach(([key, schema]) => {
    blocks[key] = schema.map((item, index) => ({
      no: item.no,
      question: item.question,
      answer: fallbackAnswers[key][index]
    }));
  });

  return {
    header: {
      category,
      name,
      audience,
      pain,
      innovation,
      uniqueness: innovation
    },
    product_core: {
      one_liner: `${name} — новый продукт в категории "${category}", который решает боль "${pain}" через новый сценарий потребления.`,
      physical_form: productDescriptor.description,
      appearance: productDescriptor.appearance,
      composition: productDescriptor.composition,
      usage: productDescriptor.usage,
      novelty_mechanism: productDescriptor.novelty,
      why_people_will_try_it: productDescriptor.tryReason
    },
    blocks,
    tech: [
      "Технология должна обслуживать главный сценарий продукта, а не жить отдельно от него.",
      "Нужно заранее зафиксировать массу/объём, стабильность качества и реалистичность MVP-производства.",
      "Конструкция или рецептура должны поддерживать новый ритуал, а не мешать ему."
    ],
    packaging: [
      "Упаковка должна за 2–3 секунды объяснять, что это за продукт и почему он новый.",
      "Конструкция упаковки должна поддерживать реальную сцену использования.",
      "На фронте нужен один главный маркер новизны и один главный маркер пользы."
    ],
    star: [
      "Продукт создаёт не просто товар, а новый сценарий потребления.",
      "Новизна считывается через форму, ритуал и упаковку.",
      "Идею можно масштабировать в линейку и в полноценный бренд."
    ],
    conclusion: `${name} выглядит жизнеспособным как MVP, если удержать предметность, честную новизну и сильный первый сценарий пробы.`
  };
}

function buildFallbackCategory(input) {
  const text = `${input.category} ${input.wish} ${input.comment}`.toLowerCase();

  if (/(батон|спорт|зал|трен|энерг)/.test(text)) {
    return "Функциональный тренировочный батончик";
  }
  if (/(завтрак|школ|дет)/.test(text)) {
    return "Готовый завтрак без готовки для школы и дороги";
  }
  if (/(паштет|намаз)/.test(text)) {
    return "Порционный продукт для намазывания и перекуса";
  }
  if (/(напит|пить)/.test(text)) {
    return "Функциональный напиток нового сценария потребления";
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
  if (/(паштет|намаз)/.test(text)) return "Мазок";
  if (/(напит)/.test(text)) return "Импульс";

  return "Ядро";
}

function buildAlternateName(category) {
  const text = sanitizeText(category).toLowerCase();

  if (text.includes("батон")) return "Подход";
  if (text.includes("завтрак")) return "Первый ход";
  if (text.includes("напит")) return "Разгон";
  if (text.includes("намаз")) return "Намёк";

  return "Контур";
}

function guessPhysicalDescriptor(category, input) {
  const text = `${category} ${input.wish} ${input.comment}`.toLowerCase();

  if (/(батон|спорт|зал|трен|энерг)/.test(text)) {
    return {
      shape: "батончика, разделённого на 4 сегмента",
      description:
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
        "Его захотят попробовать, потому что он обещает не просто энергию, а новый понятный ритуал внутри самой тренировки."
    };
  }

  if (/(школ|завтрак|дет)/.test(text)) {
    return {
      shape: "порционного завтрака-бруска",
      description:
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
        "Его попробуют, потому что он решает утреннюю боль семьи быстро, чисто и без борьбы за тарелку."
    };
  }

  return {
    shape: "порционного объекта с понятной геометрией",
    description:
      "Один основной SKU в понятном порционном формате, рассчитанный на одну сессию использования; конструкция и размер подчинены конкретному сценарию потребления.",
    appearance:
      "Продукт должен иметь заметную форму, а упаковка — быстро считываемую визуальную логику и один сильный фронтальный маркер новизны.",
    composition:
      "Состав, материалы или конструкция подчинены потребительской боли и не противоречат сценарию использования.",
    usage:
      "Продукт используют в конкретной повторяемой жизненной ситуации, где старые решения были неудобны или слабы.",
    novelty:
      "Новизна появляется из сочетания формы, сценария, ритуала, упаковки и дополнительной воспринимаемой ценности.",
      tryReason:
      "Его попробуют, если человек сразу поймёт, что именно в нём нового и зачем это нужно в реальной жизни."
  };
}

function forceName(name, input, fallback) {
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