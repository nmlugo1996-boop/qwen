"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const criteria = [
  {
    group: "Когнитивный блок",
    short: "Боль",
    full: "Насколько сильная потребительская боль выявлена и использована для создания продукта?",
  },
  {
    group: "Когнитивный блок",
    short: "Модель потребления",
    full: "Насколько изменена модель потребления по отношению к стандартной?",
  },
  {
    group: "Когнитивный блок",
    short: "Технология потребления",
    full: "Предложены ли новые привычки или ритуалы потребления?",
  },
  {
    group: "Когнитивный блок",
    short: "Нарратив",
    full: "Разработан ли убедительный объяснительный нарратив?",
  },
  {
    group: "Когнитивный блок",
    short: "Обучение",
    full: "Предложены ли эффективные способы переобучения потребителей?",
  },
  {
    group: "Сенсорный блок",
    short: "Визуальный образ",
    full: "Разработан ли сильный визуальный образ?",
  },
  {
    group: "Сенсорный блок",
    short: "Аудиальный образ",
    full: "Разработан ли сильный аудиальный образ?",
  },
  {
    group: "Сенсорный блок",
    short: "Обонятельный образ",
    full: "Разработан ли сильный обонятельный образ?",
  },
  {
    group: "Сенсорный блок",
    short: "Осязательный образ",
    full: "Разработан ли сильный осязательный образ?",
  },
  {
    group: "Сенсорный блок",
    short: "Вкусовой образ",
    full: "Разработан ли сильный вкусовой образ?",
  },
  {
    group: "Брендовый блок",
    short: "История и обещание",
    full: "Предложена ли сильная история и обещание для улучшения самоидентификации потребителя?",
  },
  {
    group: "Брендовый блок",
    short: "Контекст и тренды",
    full: "Использована ли сила контекста и трендов для продвижения бренда?",
  },
  {
    group: "Брендовый блок",
    short: "Ядро бренда",
    full: "Насколько сильное ядро бренда разработано: название, логотип, слоган, атрибуты?",
  },
  {
    group: "Брендовый блок",
    short: "Опыт потребителя",
    full: "Насколько проработан уникальный путь клиента с брендом?",
  },
  {
    group: "Брендовый блок",
    short: "Стратегия",
    full: "Насколько хорошо проработана стратегия развития бренда?",
  },
  {
    group: "Маркетинговый блок",
    short: "Сегментация и позиционирование",
    full: "Насколько хорошо выбраны сегменты ЦА и позиционирование?",
  },
  {
    group: "Маркетинговый блок",
    short: "Продукт",
    full: "Насколько эффективно развивается продукт во времени?",
  },
  {
    group: "Маркетинговый блок",
    short: "Цена",
    full: "Насколько эффективно ценообразование?",
  },
  {
    group: "Маркетинговый блок",
    short: "Каналы сбыта",
    full: "Насколько эффективны каналы сбыта?",
  },
  {
    group: "Маркетинговый блок",
    short: "Продвижение",
    full: "Насколько эффективно продвижение?",
  },
];

function clampValue(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(5, value));
}

function buildPolygon(
  values: number[],
  radius: number,
  centerX: number,
  centerY: number
) {
  const total = values.length;

  return values
    .map((value, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / total;
      const normalized = value / 5;
      const x = centerX + Math.cos(angle) * radius * normalized;
      const y = centerY + Math.sin(angle) * radius * normalized;
      return `${x},${y}`;
    })
    .join(" ");
}

function buildAxes(
  total: number,
  radius: number,
  centerX: number,
  centerY: number
) {
  return Array.from({ length: total }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / total;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    return { x, y };
  });
}

export default function AnalysisPage() {
  const [productOneName, setProductOneName] = useState("Продукт 1");
  const [productTwoName, setProductTwoName] = useState("Продукт 2");

  const [draftOne, setDraftOne] = useState<number[]>(
    Array(criteria.length).fill(0)
  );
  const [draftTwo, setDraftTwo] = useState<number[]>(
    Array(criteria.length).fill(0)
  );

  const [chartOne, setChartOne] = useState<number[]>(
    Array(criteria.length).fill(0)
  );
  const [chartTwo, setChartTwo] = useState<number[]>(
    Array(criteria.length).fill(0)
  );

  const totalOne = useMemo(
    () => chartOne.reduce((sum, value) => sum + value, 0),
    [chartOne]
  );

  const totalTwo = useMemo(
    () => chartTwo.reduce((sum, value) => sum + value, 0),
    [chartTwo]
  );

  const axes = useMemo(() => buildAxes(criteria.length, 250, 320, 320), []);
  const polygonOne = useMemo(
    () => buildPolygon(chartOne, 250, 320, 320),
    [chartOne]
  );
  const polygonTwo = useMemo(
    () => buildPolygon(chartTwo, 250, 320, 320),
    [chartTwo]
  );

  const rings = [1, 2, 3, 4, 5];

  const handleChange = (
    product: "one" | "two",
    index: number,
    value: string
  ) => {
    const parsed = clampValue(Number(value));

    if (product === "one") {
      const next = [...draftOne];
      next[index] = parsed;
      setDraftOne(next);
      return;
    }

    const next = [...draftTwo];
    next[index] = parsed;
    setDraftTwo(next);
  };

  const handleBuildChart = () => {
    setChartOne([...draftOne]);
    setChartTwo([...draftTwo]);
  };

  return (
    <main className="min-h-screen bg-[#eef3f9] px-4 py-8 text-slate-900 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_16px_60px_rgba(15,23,42,0.06)] backdrop-blur md:p-8">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5"
            >
              В главное меню
            </Link>

            <Link
              href="/generator"
              className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5"
            >
              Перейти в генератор
            </Link>
          </div>

          <h1 className="text-[38px] font-semibold leading-[1.03] tracking-[-0.03em] text-[#0f172a] md:text-[58px]">
            Сравнительный анализ двух продуктов
          </h1>

          <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600 md:text-lg">
            Введите оценки от 0 до 5 по каждому критерию, затем нажмите кнопку
            «Сделать диаграмму». Диаграмма построится на основе введённых данных.
          </p>

          <div className="mt-8 rounded-[30px] border border-slate-200 bg-slate-50/70 p-4 md:p-8">
            <div className="mb-4 flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 md:text-base">
                <span className="h-3.5 w-3.5 rounded-full bg-red-400" />
                {productOneName}
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 md:text-base">
                <span className="h-3.5 w-3.5 rounded-full bg-sky-400" />
                {productTwoName}
              </div>
            </div>

            <div className="overflow-x-auto">
              <svg
                viewBox="0 0 640 640"
                className="mx-auto h-[620px] w-[620px] max-w-full"
              >
                {rings.map((level) => {
                  const ringValues = Array(criteria.length).fill(level);
                  const points = buildPolygon(ringValues, 250, 320, 320);

                  return (
                    <polygon
                      key={level}
                      points={points}
                      fill="none"
                      stroke="#d9e2ef"
                      strokeWidth="1.2"
                    />
                  );
                })}

                {axes.map((axis, index) => (
                  <g key={criteria[index].short}>
                    <line
                      x1="320"
                      y1="320"
                      x2={axis.x}
                      y2={axis.y}
                      stroke="#d9e2ef"
                      strokeWidth="1"
                    />
                    <text
                      x={axis.x}
                      y={axis.y}
                      fill="#64748b"
                      fontSize="11"
                      textAnchor={axis.x >= 320 ? "start" : "end"}
                      dominantBaseline={axis.y >= 320 ? "hanging" : "auto"}
                    >
                      {criteria[index].short}
                    </text>
                  </g>
                ))}

                <polygon
                  points={polygonOne}
                  fill="rgba(248, 113, 113, 0.22)"
                  stroke="#f87171"
                  strokeWidth="2.5"
                />

                <polygon
                  points={polygonTwo}
                  fill="rgba(56, 189, 248, 0.22)"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />
              </svg>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4">
                <div className="text-sm text-slate-500">{productOneName}</div>
                <div className="mt-1 text-3xl font-semibold text-slate-900">
                  {totalOne} / {criteria.length * 5}
                </div>
              </div>

              <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-4">
                <div className="text-sm text-slate-500">{productTwoName}</div>
                <div className="mt-1 text-3xl font-semibold text-slate-900">
                  {totalTwo} / {criteria.length * 5}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Название продукта 1
              </label>
              <input
                value={productOneName}
                onChange={(e) => setProductOneName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-red-300"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Название продукта 2
              </label>
              <input
                value={productTwoName}
                onChange={(e) => setProductTwoName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-300"
              />
            </div>
          </div>

          <section className="mt-8 rounded-[30px] border border-white/70 bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)] md:p-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-separate border-spacing-y-3">
                <thead>
                  <tr>
                    <th className="px-4 text-left text-sm font-semibold text-slate-500">
                      Блок
                    </th>
                    <th className="px-4 text-left text-sm font-semibold text-slate-500">
                      Критерий
                    </th>
                    <th className="px-4 text-left text-sm font-semibold text-slate-500">
                      Описание
                    </th>
                    <th className="px-4 text-center text-sm font-semibold text-slate-500">
                      {productOneName}
                    </th>
                    <th className="px-4 text-center text-sm font-semibold text-slate-500">
                      {productTwoName}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {criteria.map((item, index) => (
                    <tr key={item.short} className="rounded-2xl bg-slate-50/90">
                      <td className="rounded-l-2xl px-4 py-4 align-top text-sm font-semibold text-slate-700">
                        {item.group}
                      </td>
                      <td className="px-4 py-4 align-top text-sm font-semibold text-slate-900">
                        {item.short}
                      </td>
                      <td className="px-4 py-4 align-top text-sm leading-6 text-slate-600">
                        {item.full}
                      </td>
                      <td className="px-4 py-4 text-center align-top">
                        <input
                          type="number"
                          min={0}
                          max={5}
                          step={1}
                          value={draftOne[index]}
                          onChange={(e) =>
                            handleChange("one", index, e.target.value)
                          }
                          className="w-20 rounded-xl border border-red-200 bg-white px-3 py-2 text-center outline-none focus:border-red-400"
                        />
                      </td>
                      <td className="rounded-r-2xl px-4 py-4 text-center align-top">
                        <input
                          type="number"
                          min={0}
                          max={5}
                          step={1}
                          value={draftTwo[index]}
                          onChange={(e) =>
                            handleChange("two", index, e.target.value)
                          }
                          className="w-20 rounded-xl border border-sky-200 bg-white px-3 py-2 text-center outline-none focus:border-sky-400"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <button
                onClick={handleBuildChart}
                className="inline-flex items-center justify-center rounded-2xl bg-[#111827] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Сделать диаграмму
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}