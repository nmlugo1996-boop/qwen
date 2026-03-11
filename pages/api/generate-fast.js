import fs from "fs";
import path from "path";

const REF_DIR = path.join(process.cwd(), "reference");

function safeRead(file) {
  try {
    return fs.readFileSync(path.join(REF_DIR, file), "utf8");
  } catch (error) {
    return "";
  }
}

const EXTERNAL_PROMPT = safeRead("passport_prompt.txt");

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
      question: "Сильная история и обещание бренда"
    },
    {
      no: "3.2",
      question: "Контекст: что поможет, что помешает"
    },
    {
      no: "3.3",
      question: "Ядро бренда: название, логотип, слоган, дополнительные атрибуты"
    },
    {
      no: "3.4",
      question: "Уникальный путь клиента с продуктом и брендом"
    },
    {
      no: "3.5",
      question: "Стратегия развития бренда на 3–5–10 лет"
    }
  ],
  marketing: [
    {
      no: "4.1",
      question: "Сегментация: сегменты, потребности, каналы привлечения"
    },
    {
      no: "4.2",
      question: "Базовый продукт и развитие во времени"
    },
    {
      no: "4.3",
      question: "Ценообразование"
    },
    {
      no: "4.4",
      question: "Каналы сбыта"
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

Правила:
1. Верни только JSON без markdown.
2. Все строки должны быть заполнены содержательно, без заглушек.
3. Во всех 4 блоках должно быть ровно по 5 объектов.
4. Название продукта — на русском, без латиницы.
5. Обязательно дай предметность: форма, масса, сценарий использования, упаковка, цена, каналы.
6. Не пиши пустые абстракции вроде "удобный формат", "занятые потребители", "понятная выгода" без конкретизации.
`;

const FALLBACK_SYSTEM_PROMPT = [
  "Ты — сильный маркетолог, технолог и продуктолог, работающий по методике когнитивно-сенсорного маркетинга.",
  "Работай только на русском языке.",
  "Нужно придумать один конкретный продукт и вернуть его когнитивно-сенсорный паспорт.",
  "Стиль: предметный, плотный, без воды. Нужны конкретные детали: масса, форма, упаковка, сценарий использования, цена, каналы.",
  "Название продукта должно быть на русском языке, коротким и без латиницы.",
  "Не используй пустые формулировки. Каждый тезис должен быть конкретным и пригодным для работы.",
  OUTPUT_SCHEMA_TEXT
].join("\n\n");

const SYSTEM_PROMPT = [EXTERNAL_PROMPT || FALLBACK_SYSTEM_PROMPT, OUTPUT_SCHEMA_TEXT]
  .filter(Boolean)
  .join("\n\n");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let body;
  try {
    body = req.body && typeof req.body === "object" ? req.body : await readJson(req);
  } catch (error) {
    res.status(400).json({ error: "Invalid JSON payload" });
    return;
  }

  const input = normalizeInput(body);

  try {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserMessage(input) }
    ];

    const llmDraft = await callTextModel(messages, input.temperature);
    const draft = normalizeDraft(llmDraft, input);

    res.status(200).json(draft);
  } catch (error) {
    console.error("[generate-fast] fallback because of error:", error?.message || error);
    const fallback = buildFallbackDraft(input);
    res.status(200).json(fallback);
  }
}

async function callTextModel(messages, temperature) {
  if (!process.env.QWEN_API_URL || !process.env.QWEN_API_KEY) {
    throw new Error("QWEN_API_URL or QWEN_API_KEY is not configured");
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;

  const timeoutMs = Number(process.env.REQUEST_TIMEOUT_MS || 20000);

  const timeoutId =
    controller && Number.isFinite(timeoutMs)
      ? setTimeout(() => controller.abort(), timeoutMs)
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
          Number.isFinite(temperature) ? temperature : 0.55,
          0,
          1
        ),
        top_p: 0.9,
        response_format: { type: "json_object" }
      }),
      signal: controller ? controller.signal : undefined
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `LLM request failed: ${response.status} ${text.slice(0, 500)}`
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

function normalizeDraft(rawDraft, input) {
  const fallback = buildFallbackDraft(input);

  if (!rawDraft || typeof rawDraft !== "object") {
    return fallback;
  }

  const header = {
    category: pickNonEmpty(
      sanitizeText(rawDraft.header?.category),
      sanitizeText(rawDraft.category),
      fallback.header.category
    ),
    name: normalizeRussianName(
      pickNonEmpty(
        sanitizeText(rawDraft.header?.name),
        sanitizeText(rawDraft.name),
        fallback.header.name
      ),
      fallback.header.name
    ),
    audience: pickNonEmpty(
      sanitizeText(rawDraft.header?.audience),
      sanitizeText(rawDraft.audience),
      fallback.header.audience
    ),
    pain: pickNonEmpty(
      sanitizeText(rawDraft.header?.pain),
      sanitizeText(rawDraft.pain),
      fallback.header.pain
    ),
    innovation: pickNonEmpty(
      sanitizeText(rawDraft.header?.innovation),
      sanitizeText(rawDraft.header?.uniqueness),
      sanitizeText(rawDraft.innovation),
      sanitizeText(rawDraft.uniqueness),
      fallback.header.innovation
    )
  };

  header.uniqueness = header.innovation;

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
  const tech = normalizeList(rawDraft.tech, fallback.tech);
  const packaging = normalizeList(rawDraft.packaging, fallback.packaging);
  const star = normalizeList(rawDraft.star, fallback.star);
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

  return {
    one_liner: pickNonEmpty(sanitizeText(rawCore?.one_liner), fb.one_liner),
    physical_form: pickNonEmpty(
      sanitizeText(rawCore?.physical_form),
      fb.physical_form
    ),
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
  const category = pickNonEmpty(input.category, "Новый продукт");
  const name = normalizeRussianName(
    pickNonEmpty(input.name, generatePolarName(input.category)),
    "Полярный продукт"
  );

  const audienceList = Array.isArray(input.audienceList) ? input.audienceList : [];
  const audience = pickNonEmpty(
    input.audience,
    audienceList.length
      ? audienceList.join(", ")
      : "Люди, которым нужно более умное решение привычной задачи"
  );

  const pain = pickNonEmpty(
    input.pain,
    "У аудитории есть важная незакрытая потребительская боль, которую существующие решения закрывают неудобно"
  );

  const innovation = pickNonEmpty(
    input.innovation,
    "Новый продукт совмещает ощутимую пользу, понятный сценарий использования и предметную уникальность"
  );

  const priceRange = guessPriceRange(category);

  const fallbackAnswers = {
    cognitive: [
      `Открываем новый микрорынок внутри категории "${category}": не просто товар, а более удобный и статусный способ решать боль "${pain}". Дополнительная монетизируемая ценность — ощущение, что человек выбирает более умное и современное решение.`,
      `Внедряем новые ритуалы потребления: продукт легко взять с собой, быстро открыть, использовать без лишней подготовки и встроить в повторяемый повседневный сценарий.`,
      `Объясняем инновацию через прямую выгоду: человек получает нужный результат быстрее, чище и предсказуемее, чем в существующих альтернативах.`,
      `Формируем модель: мысли — "я выбираю эффективное"; чувства — уверенность, спокойствие, контроль; поведение — регулярное повторное потребление и демонстративная рекомендация другим.`,
      `Обучаем через короткие объясняющие форматы: упаковка, QR-контент, ситуативные ролики, посев через лидеров мнений и понятные пошаговые сценарии использования.`
    ],
    sensory: [
      `Визуальный образ должен сразу выделять продукт на полке: крупный главный маркер пользы, чистая композиция, заметный цветовой код и считываемая форма упаковки.`,
      `Аудиальный образ — узнаваемый звук взаимодействия с упаковкой или продуктом: открытие, щелчок, хруст, короткий джингл в рекламе.`,
      `Обонятельный образ — контролируемый и приятный: без лишней агрессии, без ощущения "химии", с понятной ассоциацией с качеством.`,
      `Осязательный образ — удобная упаковка, которую приятно держать в руке; фактура, рельеф или материал должны усиливать ощущение качества.`,
      `Вкусовой образ — чистый и запоминающийся: без навязчивого послевкусия, с логичной линейкой вкусов и понятной ролевой функцией каждого вкуса.`
    ],
    branding: [
      `История бренда строится вокруг улучшения самоощущения: человек не идёт на компромисс, выбирает более сильный и современный способ закрывать свою потребность.`,
      `Помогают тренды на эффективность, честный состав, контроль и функциональность; мешают недоверие к новой категории, ценовое давление и путаница в позиционировании.`,
      `Ядро бренда: русское короткое название "${name}", сильный визуальный знак, обещание понятного результата и дополнительные атрибуты, которые усиливают запоминаемость.`,
      `Путь клиента: увидел — понял за 5 секунд — попробовал без барьера — встроил в ритуал — начал повторять и советовать другим.`,
      `Стратегия развития: 3 года — закрепление ядра продукта, 5 лет — расширение линейки и сценариев, 10 лет — превращение в категорийный бренд.`
    ],
    marketing: [
      `Сегментируем аудиторию по ситуации использования, силе боли и готовности платить; для каждого сегмента нужен свой канал и свой аргумент покупки.`,
      `Базовый продукт должен быть предельно понятным: конкретная форма, масса, состав, сценарий использования, а дальше — вариации по вкусам, форматам и цене.`,
      `Цена должна читаться как оправданная за счёт конкретной пользы, удобства и уникального опыта; дополнительно закладываем наборы и подписку.`,
      `Каналы сбыта выбираем по месту возникновения боли и первого теста: онлайн, профильная розница, локальные партнёры, затем масштабирование.`,
      `Продвижение строим на демонстрации сценария использования, контенте "до/после", тестовых наборах, рекомендациях и нативных партнёрствах.`
    ]
  };

  const fallbackBlocks = {};
  Object.entries(BLOCK_SCHEMAS).forEach(([key, schema]) => {
    fallbackBlocks[key] = schema.map((item, index) => ({
      no: item.no,
      question: item.question,
      answer:
        fallbackAnswers[key][index] || `Нужно раскрыть вопрос: ${item.question}`
    }));
  });

  const productCore = {
    one_liner: `${name} — новый продукт в категории "${category}", который помогает решить боль "${pain}" без лишних компромиссов.`,
    physical_form: `Физическая форма: компактная порционная единица, рассчитанная на 1 употребление; ориентир по цене — ${priceRange}.`,
    appearance:
      "Внешний вид: чистый современный дизайн, крупный маркер ключевой пользы, понятное цветовое кодирование вкусов или вариантов.",
    composition: `Состав: базовые ингредиенты категории "${category}" без лишнего усложнения; формула подчинена задаче закрыть боль "${pain}".`,
    usage:
      "Сценарий использования: человек быстро достаёт продукт, открывает без подготовки и использует в ситуации, где обычные решения неудобны.",
    novelty_mechanism:
      "Новизна создаётся не ради новизны, а через более удачное сочетание формы, пользы, сценария использования и восприятия.",
    why_people_will_try_it:
      "Продукт попробуют, потому что он обещает более удобный и конкретный результат, чем привычные альтернативы."
  };

  const tech = [
    "Технология должна поддерживать главное обещание продукта, а не существовать отдельно от него.",
    "Нужна спецификация базового состава, массы порции, срока годности и стабильности качества.",
    "Производственный процесс должен быть простым для MVP и достаточно управляемым для масштабирования."
  ];

  const packaging = [
    "Упаковка должна открываться быстро и без раздражения.",
    "На лицевой стороне нужен один главный маркер пользы, читаемый за 2–3 секунды.",
    "Форма упаковки должна поддерживать сценарий использования, а не мешать ему."
  ];

  const star = [
    "Продукт закрывает понятную боль без длинных объяснений.",
    "У него есть не только рациональная выгода, но и социальная / эмоциональная ценность.",
    "Его можно масштабировать в линейку, а не оставить одиночной идеей."
  ];

  const conclusion = `Продукт "${name}" в категории "${category}" выглядит жизнеспособным как MVP: у него есть понятная боль, конкретный сценарий использования и основа для сильного позиционирования.`;

  return {
    header: {
      category,
      name,
      audience,
      pain,
      innovation,
      uniqueness: innovation
    },
    product_core: productCore,
    blocks: fallbackBlocks,
    tech,
    packaging,
    star,
    conclusion
  };
}

function normalizeInput(body) {
  const source =
    body && typeof body.form === "object" && body.form !== null
      ? body.form
      : body || {};

  const category = sanitizeText(
    source.category || source.niche || source.industry
  );

  const name = sanitizeText(source.name || source.productName);

  const audienceList = Array.isArray(source.audience)
    ? source.audience.map((item) => sanitizeText(item)).filter(Boolean)
    : sanitizeText(source.audience)
      ? sanitizeText(source.audience)
          .split(/[,;]+/)
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const painsArray = Array.isArray(source.pains)
    ? source.pains.map((item) => sanitizeText(item)).filter(Boolean)
    : [];

  const pain = pickNonEmpty(
    sanitizeText(source.pain),
    sanitizeText(source.pain_point),
    painsArray[0]
  );

  const innovation = pickNonEmpty(
    sanitizeText(source.innovation),
    sanitizeText(source.uniqueness),
    sanitizeText(source.user_request),
    sanitizeText(source.idea),
    sanitizeText(source.wish)
  );

  const comment = pickNonEmpty(
    sanitizeText(source.comment),
    sanitizeText(source.additional),
    sanitizeText(source.notes)
  );

  const diagnostics =
    source.diagnostics && typeof source.diagnostics === "object"
      ? source.diagnostics
      : {};

  const tempCandidate =
    typeof source.temperature === "number"
      ? source.temperature
      : typeof body.temperature === "number"
        ? body.temperature
        : 0.55;

  return {
    category: pickNonEmpty(category, "Новый продукт"),
    name,
    audience: audienceList.join(", "),
    audienceList,
    pain,
    innovation,
    comment,
    diagnostics,
    temperature: clamp(
      Number.isFinite(tempCandidate) ? tempCandidate : 0.55,
      0,
      1
    )
  };
}

function buildUserMessage(input) {
  const parts = [
    "ВХОДНЫЕ ДАННЫЕ:",
    `1. Отрасль / ниша: ${input.category || "-"}`,
    input.name
      ? `2. Предпочитаемое название: ${input.name}`
      : "2. Название: придумай рабочее русское название без латиницы",
    `3. Потребительская боль: ${input.pain || "-"}`,
    `4. Целевая аудитория: ${input.audience || "-"}`,
    `5. Дополнительная гипотеза / хотелка: ${input.innovation || "-"}`,
    `6. Температура: ${input.temperature}`
  ];

  if (input.comment && input.comment.trim()) {
    parts.push(`7. Дополнительные пожелания пользователя: ${input.comment}`);
  }

  if (input.diagnostics && typeof input.diagnostics === "object") {
    const selectedDiagnostics = Object.entries(input.diagnostics)
      .filter(([_, value]) => value === "yes")
      .map(([key]) => key);

    if (selectedDiagnostics.length > 0) {
      parts.push(
        `8. Важные блоки для усиленной проработки: ${selectedDiagnostics.join(", ")}`
      );
    }
  }

  parts.push(
    "",
    "ТРЕБОВАНИЯ К КАЧЕСТВУ:",
    "- продукт должен быть конкретным, а не абстрактной категорией;",
    "- в паспорте должны быть реальные сценарии использования;",
    "- в маркетинге укажи конкретные каналы, а не общие слова;",
    "- в product_core обязательно пропиши форму, внешний вид, состав, сценарий, механизм новизны;",
    "- в header.uniqueness и header.innovation должен быть один и тот же сильный тезис;",
    "- не используй латиницу в названии."
  );

  return parts.join("\n");
}

function extractBlock(rawDraft, key) {
  if (!rawDraft || typeof rawDraft !== "object") {
    return null;
  }

  const candidate = rawDraft.blocks?.[key] ?? rawDraft[key];
  if (Array.isArray(candidate) || (candidate && typeof candidate === "object")) {
    return candidate;
  }

  return null;
}

function extractAnswer(rawBlock, item, index) {
  if (!rawBlock) {
    return "";
  }

  if (Array.isArray(rawBlock)) {
    const byNo = rawBlock.find((entry) => matchesNo(entry, item.no));
    if (byNo !== undefined) {
      return sanitizeText(byNo);
    }
    if (rawBlock[index] !== undefined) {
      return sanitizeText(rawBlock[index]);
    }
    return "";
  }

  if (typeof rawBlock === "object") {
    const byNo = rawBlock[item.no];
    if (byNo !== undefined) {
      return sanitizeText(byNo);
    }

    if (rawBlock[item.question] !== undefined) {
      return sanitizeText(rawBlock[item.question]);
    }

    const lowerQuestion = item.question.toLowerCase();
    for (const [key, value] of Object.entries(rawBlock)) {
      const lowerKey = key.toLowerCase();
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
  if (!content) {
    return null;
  }

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
  if (value === null || value === undefined) {
    return "";
  }

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

function pickNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function matchesNo(entry, no) {
  if (!entry) {
    return false;
  }

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

function normalizeRussianName(rawName, fallback) {
  const text = sanitizeText(rawName);
  if (!text) return fallback;

  const hasCyrillic = /[А-Яа-яЁё]/.test(text);
  const hasLatin = /[A-Za-z]/.test(text);

  if (hasCyrillic && !hasLatin) {
    return text;
  }

  return fallback;
}

function generatePolarName(category) {
  const text = sanitizeText(category).toLowerCase();

  if (text.includes("мяс")) return "Мясовой код";
  if (text.includes("снек")) return "Точный укус";
  if (text.includes("батон")) return "Сила внутри";
  if (text.includes("напит")) return "Чистый импульс";
  if (text.includes("десерт")) return "Умный вкус";
  if (text.includes("завтрак")) return "Утро без шума";

  return "Полярный выбор";
}

function guessPriceRange(category) {
  const text = sanitizeText(category).toLowerCase();

  if (text.includes("мяс")) return "149–179 ₽";
  if (text.includes("батон")) return "89–129 ₽";
  if (text.includes("напит")) return "99–149 ₽";
  if (text.includes("десерт")) return "119–169 ₽";

  return "99–199 ₽";
}