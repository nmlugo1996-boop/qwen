"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

function formatAudience(audience) {
  if (Array.isArray(audience)) return audience.join(", ");
  if (typeof audience === "string") return audience;
  return "—";
}

function normalizeListValue(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/\r?\n+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export default function ResultPreview({ draft, loading, celebration = false }) {
  const [prevDraft, setPrevDraft] = useState(null);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);
  const [copied, setCopied] = useState(false);

  const header = draft?.header ?? {};
  const blocks = draft?.blocks ?? {};

  useEffect(() => {
    if (draft && !loading && draft !== prevDraft) {
      setPrevDraft(draft);
    }
  }, [draft, loading, prevDraft]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(t);
  }, [copied]);

  const getValue = useCallback(
    (key, fallback = "—") => {
      switch (key) {
        case "audience":
          return formatAudience(header.audience ?? draft?.audience);
        case "innovation":
          return header.innovation ?? header.unique ?? draft?.uniqueness ?? fallback;
        default:
          return header[key] ?? draft?.[key] ?? fallback;
      }
    },
    [draft, header]
  );

  const blockOrder = useMemo(
    () => [
      { key: "cognitive", title: "Когнитивный блок" },
      { key: "sensory", title: "Сенсорный блок" },
      { key: "branding", title: "Брендинговый блок" },
      { key: "marketing", title: "Маркетинговый блок" }
    ],
    []
  );

  const buildPassportText = useCallback(() => {
    if (!draft) return "";

    const lines = [];

    lines.push("Паспорт уникального продукта");
    lines.push("");
    lines.push("КРАТКИЙ ПАСПОРТ");
    lines.push(`Категория: ${getValue("category")}`);
    lines.push(`Название: ${getValue("name")}`);
    lines.push(`Целевая аудитория: ${getValue("audience")}`);
    lines.push(`Потребительская боль: ${getValue("pain")}`);
    lines.push(`Уникальность: ${getValue("innovation")}`);
    lines.push("");

    blockOrder.forEach((block) => {
      const rows = Array.isArray(blocks[block.key]) ? blocks[block.key] : [];
      if (!rows.length) return;

      lines.push(block.title.toUpperCase());
      rows.forEach((row) => {
        const no = row?.no ? String(row.no).trim() : "";
        const question = row?.question || "";
        const answer = row?.answer || "";

        lines.push("");
        lines.push(no ? `${no}. ${question}` : question);
        lines.push(answer);
      });
      lines.push("");
    });

    const techItems = normalizeListValue(draft?.tech);
    const packagingItems = normalizeListValue(draft?.packaging);

    if (techItems.length || packagingItems.length) {
      lines.push("ДОПОЛНИТЕЛЬНО");
      lines.push("");

      if (techItems.length) {
        lines.push("Технология и состав:");
        techItems.forEach((item) => lines.push(`- ${item}`));
        lines.push("");
      }

      if (packagingItems.length) {
        lines.push("Форм-фактор и упаковка:");
        packagingItems.forEach((item) => lines.push(`- ${item}`));
        lines.push("");
      }
    }

    return lines.join("\n");
  }, [draft, blocks, getValue, blockOrder]);

  const handleCopy = useCallback(() => {
    const text = buildPassportText();
    if (!text) return;

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopied(true);
    }
  }, [buildPassportText]);

  const handleDownloadDocx = useCallback(async () => {
    if (!draft) return;

    try {
      setIsDownloadingDocx(true);

      const response = await fetch("/api/passport-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft })
      });

      if (!response.ok) {
        let message = `DOCX API ${response.status}`;
        try {
          const error = await response.json();
          if (error?.error) message = error.error;
        } catch (_) {}
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const rawName = draft?.header?.name || draft?.name || "passport";
      const safeName =
        String(rawName)
          .trim()
          .replace(/[\\/:*?"<>|]+/g, "")
          .replace(/\s+/g, " ")
          .trim() || "passport";

      const link = document.createElement("a");
      link.href = url;
      link.download = `${safeName}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("DOCX download error:", error);
      alert(error instanceof Error ? error.message : "Не удалось скачать DOCX");
    } finally {
      setIsDownloadingDocx(false);
    }
  }, [draft]);

  const renderPlaceholder = () => {
    if (loading) {
      return (
        <div className="rounded-3xl border border-[#F0D9D2] bg-gradient-to-b from-[#FFF7F4] to-white p-5">
          <div className="space-y-4">
            <div className="h-4 w-36 rounded-full bg-[#F5D9D2]" />
            <div className="h-12 w-full rounded-2xl bg-[#F9E6E1]" />
            <div className="h-12 w-[92%] rounded-2xl bg-[#F9E6E1]" />
            <div className="h-12 w-[84%] rounded-2xl bg-[#F9E6E1]" />
          </div>
          <p className="mt-4 text-sm text-neutral-500">
            Паспорт собирается. Как только генерация закончится, здесь появится результат.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-3xl border border-neutral-200 bg-white/70 p-6">
        <p className="text-lg text-neutral-500">
          Здесь появится готовый паспорт после генерации.
        </p>
      </div>
    );
  };

  const Card = ({ title, children }) => (
    <div className="rp-card rounded-3xl border border-neutral-200/70 bg-white/80 p-4 shadow-[0_8px_30px_rgba(17,24,39,0.06)] md:p-5">
      <h3 className="text-base font-semibold text-neutral-800 md:text-lg">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );

  return (
    <aside className="flex flex-col gap-4 md:gap-6 lg:sticky lg:top-32">
      {celebration ? (
        <div className="rp-badge rounded-3xl p-4 text-center text-xs md:text-sm shadow-[0_12px_40px_rgba(255,91,91,0.15)]">
          Поздравляем! Вы создали новый продукт!
        </div>
      ) : null}

      <section
        id="full-passport"
        className="rp-panel overflow-hidden rounded-3xl border border-white/40 bg-white/90 shadow-[0_22px_70px_rgba(0,0,0,0.10)] backdrop-blur-xl transition-opacity duration-500"
        aria-live="polite"
        style={{ opacity: draft && !loading ? 1 : 0.98 }}
      >
        {/* Премиальная шапка */}
        <div className="rp-header border-b border-neutral-200/70 px-6 pb-5 pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-neutral-900">
                Паспорт уникального продукта
              </h2>
              <p className="text-sm text-neutral-600">
                Когнитивно-сенсорный маркетинговый паспорт по методике «Полярная звезда»
              </p>
            </div>

            {/* Кнопки: одинаковая геометрия + shine */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleDownloadDocx}
                disabled={!draft || isDownloadingDocx}
                className="rp-btn rp-btn-dark inline-flex h-12 w-full items-center justify-center rounded-full px-6 text-sm font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isDownloadingDocx ? "Готовим DOCX..." : "Скачать DOCX"}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!draft}
                className="rp-btn rp-btn-accent inline-flex h-12 w-full items-center justify-center rounded-full px-6 text-sm font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copied ? "Скопировано ✓" : "Скопировать паспорт"}
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {!draft ? (
            renderPlaceholder()
          ) : (
            <div id="fp-content" className="flex flex-col gap-4 md:gap-6">
              <Card title="Краткий паспорт">
                <div className="overflow-x-auto rounded-2xl border border-neutral-200/80">
                  <table className="min-w-[560px] w-full border-collapse text-xs text-neutral-700 md:min-w-0 md:text-sm">
                    <thead className="bg-neutral-100/80 text-left uppercase tracking-wide text-neutral-500">
                      <tr>
                        <th className="px-4 py-3">Параметр</th>
                        <th className="px-4 py-3">Значение</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="odd:bg-white even:bg-neutral-50/70">
                        <td className="px-4 py-3 align-top font-semibold text-neutral-700">Категория</td>
                        <td className="px-4 py-3 align-top text-neutral-600">{getValue("category")}</td>
                      </tr>
                      <tr className="odd:bg-white even:bg-neutral-50/70">
                        <td className="px-4 py-3 align-top font-semibold text-neutral-700">Название</td>
                        <td className="px-4 py-3 align-top text-neutral-600">{getValue("name")}</td>
                      </tr>
                      <tr className="odd:bg-white even:bg-neutral-50/70">
                        <td className="px-4 py-3 align-top font-semibold text-neutral-700">Целевая аудитория</td>
                        <td className="px-4 py-3 align-top text-neutral-600">{getValue("audience")}</td>
                      </tr>
                      <tr className="odd:bg-white even:bg-neutral-50/70">
                        <td className="px-4 py-3 align-top font-semibold text-neutral-700">Потребительская боль</td>
                        <td className="px-4 py-3 align-top text-neutral-600">{getValue("pain")}</td>
                      </tr>
                      <tr className="odd:bg-white even:bg-neutral-50/70">
                        <td className="px-4 py-3 align-top font-semibold text-neutral-700">Уникальность</td>
                        <td className="px-4 py-3 align-top text-neutral-600">{getValue("innovation")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>

              {blockOrder.map((block) => {
                const rows = Array.isArray(blocks[block.key]) ? blocks[block.key] : [];
                if (!rows.length) return null;

                return (
                  <Card key={block.key} title={block.title}>
                    <div className="overflow-x-auto rounded-2xl border border-neutral-200/80">
                      <table className="min-w-[600px] w-full border-collapse text-xs text-neutral-700 md:min-w-0 md:text-sm">
                        <thead className="bg-neutral-100/80 text-left uppercase tracking-wide text-neutral-500">
                          <tr>
                            <th className="px-4 py-3">№</th>
                            <th className="px-4 py-3">Вопрос</th>
                            <th className="px-4 py-3">Ответ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, index) => (
                            <tr key={`${block.key}-${index}`} className="odd:bg-white even:bg-neutral-50/70">
                              <td className="px-4 py-3 align-top font-semibold text-neutral-500">
                                {row?.no ?? index + 1}
                              </td>
                              <td className="px-4 py-3 align-top font-medium text-neutral-700">
                                {row?.question || ""}
                              </td>
                              <td className="px-4 py-3 align-top text-neutral-600">
                                {row?.answer || ""}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                );
              })}

              <Card title="Дополнительно">
                <div className="grid gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-800 md:text-base">
                      Технология и состав
                    </h4>
                    <div className="mt-2 whitespace-pre-line text-sm text-neutral-700">
                      {normalizeListValue(draft?.tech).length ? (
                        <ul className="list-disc space-y-1 pl-5">
                          {normalizeListValue(draft?.tech).map((item, index) => (
                            <li key={`tech-${index}`}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-neutral-800 md:text-base">
                      Форм-фактор и упаковка
                    </h4>
                    <div className="mt-2 whitespace-pre-line text-sm text-neutral-700">
                      {normalizeListValue(draft?.packaging).length ? (
                        <ul className="list-disc space-y-1 pl-5">
                          {normalizeListValue(draft?.packaging).map((item, index) => (
                            <li key={`packaging-${index}`}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Локальные “дорогие” стили без глобальных файлов */}
        <style jsx>{`
          .rp-panel {
            background:
              radial-gradient(1200px 400px at 20% -10%, rgba(255, 91, 91, 0.10), transparent 55%),
              radial-gradient(900px 300px at 90% 0%, rgba(255, 155, 122, 0.10), transparent 55%),
              rgba(255, 255, 255, 0.92);
          }

          .rp-header {
            background:
              linear-gradient(180deg, rgba(255, 244, 241, 0.95) 0%, rgba(255, 255, 255, 0.90) 100%);
          }

          .rp-badge {
            background: linear-gradient(90deg, rgba(255, 91, 91, 0.12), rgba(255, 155, 122, 0.10));
            border: 1px solid rgba(255, 91, 91, 0.18);
            color: #7a3a34;
          }

          .rp-card {
            transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
          }

          .rp-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 18px 60px rgba(17, 24, 39, 0.10);
            border-color: rgba(255, 91, 91, 0.18);
          }

          .rp-btn {
            position: relative;
            overflow: hidden;
            transform: translateY(0);
            transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
            outline: none;
          }

          .rp-btn:focus-visible {
            box-shadow: 0 0 0 4px rgba(255, 91, 91, 0.20), 0 10px 30px rgba(17, 24, 39, 0.12);
          }

          .rp-btn:hover {
            transform: translateY(-1px);
            filter: saturate(1.06);
          }

          .rp-btn:active {
            transform: translateY(0px) scale(0.99);
          }

          .rp-btn::after {
            content: "";
            position: absolute;
            top: -40%;
            left: -30%;
            width: 40%;
            height: 180%;
            transform: rotate(18deg);
            background: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0.25) 45%,
              rgba(255, 255, 255, 0) 100%
            );
            opacity: 0;
            transition: opacity 180ms ease;
          }

          .rp-btn:hover::after {
            opacity: 1;
            animation: rpShine 900ms ease forwards;
          }

          @keyframes rpShine {
            0% {
              transform: translateX(-20%) rotate(18deg);
            }
            100% {
              transform: translateX(320%) rotate(18deg);
            }
          }

          .rp-btn-dark {
            background: linear-gradient(180deg, #111827 0%, #0b1220 100%);
            box-shadow: 0 12px 30px rgba(17, 24, 39, 0.18);
          }

          .rp-btn-dark:hover {
            box-shadow: 0 16px 46px rgba(17, 24, 39, 0.22);
          }

          .rp-btn-accent {
            background: linear-gradient(90deg, #ff5b5b 0%, #ff7b5b 100%);
            box-shadow: 0 12px 30px rgba(255, 91, 91, 0.22);
          }

          .rp-btn-accent:hover {
            box-shadow: 0 16px 52px rgba(255, 91, 91, 0.28);
          }
        `}</style>
      </section>
    </aside>
  );
}