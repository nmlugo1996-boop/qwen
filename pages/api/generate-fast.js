import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: true
  },
  maxDuration: 300
};

const REF_DIR = path.join(process.cwd(), "reference");

const BLOCK_SCHEMAS = {
  cognitive: [
    {
      no: "1.1",
      question: "Боль: какую реальную боль, трение или неудобство продукт снимает?"
    },
    {
      no: "1.2",
      question: "Новый рынок / новая ценность: какой новый подрынок или способ потребления открываем?"
    },
    {
      no: "1.3",
      question: "Новые привычки потребления: какой ритуал, паттерн или сценарий внедряем?"
    },
    {
      no: "1.4",
      question: "Нарратив: как объясняем, почему продукт нужен, чем он отличается и почему его стоит попробовать?"
    },
    {
      no: "1.5",
      question: "Механика обучения: как быстро обучаем потребителя пользоваться продуктом и понимать его ценность?"
    }
  ],
  sensory: [
    {
      no: "2.1",
      question: "Визуальный образ: как продукт выглядит, как считывается на полке и в руке?"
    },
    {
      no: "2.2",
      question: "Аудиальный образ: какие звуки сопровождают взаимодействие с продуктом?"
    },
    {
      no: "2.3",
      question: "Обонятельный образ: какой запах возникает при контакте с продуктом?"
    },
    {
      no: "2.4",
      question: "Осязательный образ: какие тактильные ощущения создают продукт и упаковка?"
    },
    {
      no: "2.5",
      question: "Вкусовой образ: какой вкус или послевкусие остаётся, если категория это предполагает?"
    }
  ],
  branding: [
    {
      no: "3.1",
      question: "История и самоидентификация: кто этот бренд и в чём его обещание?"
    },
    {
      no: "3.2",
      question: "Контекст: какие факторы помогут росту и какие риски будут мешать?"
    },
    {
      no: "3.3",
      question: "Ядро бренда: название, слоган, логотип, key visual, бренд-код"
    },
    {
      no: "3.4",
      question: "Путь клиента: как человек впервые замечает, пробует, повторяет и рекомендует продукт?"
    },
    {
      no: "3.5",
      question: "Стратегия развития 3–5–10 лет: как продукт расширяется в линейку и категорию?"
    }
  ],
  marketing: [
    {
      no: "4.1",
      question: "Сегменты / позиционирование: кому продаём, для какой ситуации и почему выберут именно нас?"
    },
    {
      no: "4.2",
      question: "Линейка продукта: базовый SKU, дальнейшие расширения, версии, форматы"
    },
    {
      no: "4.3",
      question: "Ценообразование: какая цена, за что её готовы платить и как она считывается рынком?"
    },
    {
      no: "4.4",
      question: "Каналы продаж: где именно покупать, в каких каналах продукт лучше всего взлетает?"
    },
    {
      no: "4.5",
      question: "Продвижение: какими сообщениями и механиками запускаем интерес, пробу и повторную покупку?"
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
2. Все строки должны быть содержательными, без заглушек.
3. Во всех 4 блоках должно быть ровно по 5 объектов.
4. Название продукта — на русском, без латиницы.
5. Продукт должен быть физически понятным: размер, масса, форма, упаковка, способ открытия, способ использования.
6. Укажи конкретные сценарии использования, а не абстракции.
7. Упаковка, состав, цена, каналы и сценарии должны согласовываться между собой.
8. Не используй пустые слова вроде "удобный формат", "премиальный", "понятная выгода", если они не расшифрованы предметно.
`;

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
      .filter((file) => {
        const lower = file.toLowerCase();
        return lower.endsWith(".md") || lower.endsWith(".txt");
      })
      .filter((file) => file !== "passport_prompt.txt")
      .sort();
  } catch (error) {
    return [];
  }
}

function buildReferenceLibrary() {
  const files = getReferenceFiles();
  const maxChars = Number(process.env.MAX_REFERENCE_CHARS || 120000);

  let result = "";
  let used = 0;

  for (const file of files) {
    const content = safeRead(path.join(REF_DIR, file)).trim();
    if (!content) continue;

    const chunk = `\n\n=== РЕФЕРЕНС: ${file} ===\n${content}`;
    if (used + chunk.length > maxChars) break;

    result += chunk;
    used += chunk.length;
  }

  return result.trim();
}

const EXTERNAL_PROMPT = safeRead(path.join(REF_DIR, "passport_prompt.txt")).trim();
const REFERENCE_LIBRARY = buildReferenceLibrary();

const FALLBACK_SYSTEM_PROMPT = [
  "Ты — профессиональный продуктолог, маркетолог, бренд-стратег и когнитивный аналитик.",
  "Ты работаешь по методике когнитивно-сенсорного маркетинга и по логике паспорта «Полярная Звезда».",
  "Твоя задача — на основе входных данных придумать ОДИН новый конкретный продукт и вернуть полный когнитивно-сенсорный паспорт в JSON.",
  "Работай только на русском языке.",
  "Думай как практик, который придумывает реальный MVP-продукт, а не как абстрактный копирайтер.",
  "Продукт должен быть физически понятным: что это, какого размера, как выглядит, как открывается, как используется, где хранится, почему его захотят попробовать.",
  "Ответ должен быть плотным, прикладным, детализированным и похожим по глубине на сильный продуктовый референс уровня «Шоковсянка».",
  "Не придумывай фальшивую инновационность. Уникальность должна объяснять, почему продукт заметят, поймут и попробуют.",
  "Используй стиль, глубину и логику приложенных референсов, но не копируй их буквально.",
  OUTPUT_SCHEMA_TEXT
].join("\n\n");

const SYSTEM_PROMPT = [
  EXTERNAL_PROMPT || FALLBACK_SYSTEM_PROMPT,
  REFERENCE_LIBRARY
    ? `Ниже библиотека референсов. Используй её как ориентир по глубине, логике, плотности конкретики и уровню детализации, но создай НОВЫЙ продукт, а не вариацию существующего:\n${REFERENCE_LIBRARY}`
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

  const timeoutMs = Number(process.env.REQUEST_TIMEOUT_MS || 290000);

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
          Number.isFinite(temperature) ? temperature : 0.45,
          0,
          1
        ),
        top_p: Number(process.env.TOP_P || 0.85),
        max_tokens: Number(process.env.MAX_TOKENS || 12000),
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
    usage: pickNonEmpty(
      sanitizeText(rawCore?.usage),
      fb.usage
    ),
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
      : "Люди с конкретной болью, которую текущие решения закрывают неудобно, скучно или не полностью"
  );

  const pain = pickNonEmpty(
    input.pain,
    "Есть незакрытая потребительская боль, которую существующие решения закрывают не до конца"
  );

  const innovation = pickNonEmpty(
    input.innovation,
    "Продукт создаёт новый сценарий потребления за счёт сочетания формы, ритуала, упаковки и внятной пользы"
  );

  const priceRange = guessPriceRange(category);

  const fallbackAnswers = {
    cognitive: [
      `Продукт снимает конкретную боль "${pain}" не декларативно, а через более удачный сценарий использования, чем у привычных решений в категории "${category}".`,
      `Открываем новый подрынок внутри категории "${category}": не просто товар, а новый формат поведения, в котором человек покупает не вещь, а более точный способ закрыть свою задачу.`,
      `Внедряем повторяемый ритуал: продукт удобно брать в конкретную жизненную ситуацию, быстро использовать и затем повторять без дополнительного обучения.`,
      `Нарратив строится так: старые решения либо неудобны, либо скучны, либо не дают нужного эффекта; новый продукт убирает это трение и делает результат более осязаемым.`,
      `Обучаем потребителя через упаковку, первые сценарии использования, короткие формулировки, демонстрацию в точке продажи и понятный первый опыт без когнитивной перегрузки.`
    ],
    sensory: [
      `Визуально продукт должен читаться как новый и конкретный: заметная форма, ясная композиция, крупный маркер пользы и кодировка вариаций без визуального шума.`,
      `Аудиальный образ — звук открытия, надлома, щелчка, наливания или иного взаимодействия, который усиливает ощущение качества и сценария использования.`,
      `Обонятельный образ должен быть связан с обещанием продукта: чистый, узнаваемый, без ощущения дешёвой химии или случайного ароматического шума.`,
      `Осязательный образ строится через материал упаковки, рельеф, жёсткость, матовость или гладкость — так, чтобы рука считывала качество ещё до использования.`,
      `Если категория съедобная, вкус должен не просто нравиться, а подтверждать идею продукта; если несъедобная, вместо вкуса даётся вкусовая метафора и ожидаемое ощущение во рту или дыхании.`
    ],
    branding: [
      `Бренд говорит не "мы инновационные", а "мы по-новому решаем понятную бытовую задачу"; самоидентификация строится вокруг нового умного повседневного ритуала.`,
      `Контекст помогает, если рынок устал от однотипности и ищет новые форматы; мешают недоверие к непривычной категории, слабая упаковка и неясный первый сценарий пробы.`,
      `Ядро бренда строится вокруг русского названия "${name}", короткого обещания, запоминаемого визуального кода и одного доминирующего образа, который легко вспоминать.`,
      `Путь клиента: увидел необычную форму — понял, в чём смысл — захотел протестировать — получил быстрый первый эффект — встроил в свою привычку — стал рассказывать другим.`,
      `На 3 года — закрепляем базовый продукт; на 5 лет — делаем линейку по ситуациям и аудиториям; на 10 лет — превращаем решение в полноценную категорию или субкатегорию.`
    ],
    marketing: [
      `Позиционирование должно быть не "для всех", а для понятной ситуации, боли и мотива покупки; сегменты описываются через момент использования, а не только по возрасту.`,
      `Линейка начинается с одного самого сильного и считываемого SKU, потом расширяется по вкусам, форматам, объёму, цене или функциональным сценариям.`,
      `Цена должна быть объяснима через физическую конкретику продукта, силу нового опыта и частоту повторной покупки; ориентир — ${priceRange}.`,
      `Каналы продаж подбираются по месту первого понимания и первой пробы: маркетплейс, DTC, полка у конкретного ритейлера, импульсная зона, партнёрские точки.`,
      `Продвижение строится на показе сценария использования, разборе боли, демонстрации упаковки и механики продукта, а также на первом пробном касании без длинных объяснений.`
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
    one_liner: `${name} — новый продукт в категории "${category}", который по-новому закрывает боль "${pain}".`,
    physical_form: `Физическая форма: реальный товар с понятным размером, способом открытия и сценарием использования; ориентир по цене — ${priceRange}.`,
    appearance: "Внешний вид должен быть достаточно новым, чтобы притягивать внимание, но достаточно понятным, чтобы не пугать первую покупку.",
    composition: `Состав, материалы или конструкция подчинены задаче решить боль "${pain}" и не должны противоречить сценарию использования.`,
    usage: "Сценарий использования должен быть конкретным: где человек достаёт продукт, как открывает, как использует, что чувствует в первые секунды и зачем возвращается к нему снова.",
    novelty_mechanism: "Новизна строится не на фантазии, а на точном сочетании формы, ритуала, упаковки, сенсорного образа и понятного обещания.",
    why_people_will_try_it: "Продукт попробуют, потому что он визуально и смыслово отличается, но при этом сразу объясняет, что именно нового человек получит."
  };

  const tech = [
    "Технология и конструкция продукта должны поддерживать главный потребительский сценарий, а не существовать отдельно от него.",
    "Нужны чёткие параметры MVP: масса или объём, состав или материалы, срок годности или стабильность, требования к производству.",
    "Производственная логика должна позволять выпустить пилот быстро, без избыточной сложности и ложной инновационности."
  ];

  const packaging = [
    "Упаковка должна за 2–3 секунды объяснять, что это за продукт, в чём его новизна и как его использовать.",
    "Форма упаковки должна поддерживать сценарий потребления: легко взять, открыть, использовать и выбросить или сохранить.",
    "На лицевой стороне нужен один главный маркер новизны и один главный маркер пользы, без визуальной каши."
  ];

  const star = [
    "У продукта есть не только идея, но и новый поведенческий сценарий.",
    "Новизна считывается через форму, ритуал и упаковку, а не только через слова.",
    "Продукт можно масштабировать в линейку, не теряя ядро бренда."
  ];

  const conclusion = `Продукт "${name}" в категории "${category}" выглядит жизнеспособным как MVP, если удержать предметность, сильный первый сценарий пробы и честную уникальность без декоративной инновационности.`;

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
        : 0.45;

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
      Number.isFinite(tempCandidate) ? tempCandidate : 0.45,
      0,
      1
    )
  };
}

function buildUserMessage(input) {
  const parts = [
    "ВХОДНЫЕ ДАННЫЕ ДЛЯ СОЗДАНИЯ НОВОГО ПРОДУКТА:",
    `1. Категория / ниша: ${input.category || "-"}`,
    input.name
      ? `2. Предпочитаемое название: ${input.name}`
      : "2. Название: придумай самостоятельно, на русском языке, без латиницы",
    `3. Боль: ${input.pain || "-"}`,
    `4. Целевая аудитория: ${input.audience || "-"}`,
    `5. Дополнительная гипотеза / комментарий: ${input.innovation || "-"}`,
    `6. Температура генерации: ${input.temperature}`
  ];

  if (input.comment && input.comment.trim()) {
    parts.push(`7. Дополнительные пожелания: ${input.comment}`);
  }

  if (input.diagnostics && typeof input.diagnostics === "object") {
    const selectedDiagnostics = Object.entries(input.diagnostics)
      .filter(([_, value]) => value === "yes")
      .map(([key]) => key);

    if (selectedDiagnostics.length > 0) {
      parts.push(
        `8. Усилить внимание к блокам: ${selectedDiagnostics.join(", ")}`
      );
    }
  }

  parts.push(
    "",
    "КРИТИЧЕСКИЕ ТРЕБОВАНИЯ:",
    "- создай именно НОВЫЙ продукт, а не опиши существующую категорию общими словами;",
    "- продукт должен быть физически конкретным;",
    "- обязательно опиши форму, внешний вид, состав или конструкцию, упаковку, сценарий использования;",
    "- покажи, как возникает проба, почему человек замечает продукт и почему возвращается;",
    "- делай ответ близким по глубине к сильному эталону уровня «Шоковсянка»;",
    "- не используй пустые клише;",
    "- возвращай только валидный JSON."
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

  if (text.includes("мяс")) return "Ясномяс";
  if (text.includes("снек")) return "Хрустметка";
  if (text.includes("батон")) return "Зарядка";
  if (text.includes("напит")) return "Импульс";
  if (text.includes("десерт")) return "Смысл вкуса";
  if (text.includes("завтрак")) return "Первый ход";
  if (text.includes("паштет")) return "Мазок";
  if (text.includes("пылес")) return "Тихоход";

  return "Новая полка";
}

function guessPriceRange(category) {
  const text = sanitizeText(category).toLowerCase();

  if (text.includes("мяс")) return "149–249 ₽";
  if (text.includes("батон")) return "89–149 ₽";
  if (text.includes("напит")) return "99–179 ₽";
  if (text.includes("десерт")) return "119–229 ₽";
  if (text.includes("паштет")) return "139–219 ₽";

  return "99–299 ₽";
}