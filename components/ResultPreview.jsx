"use client";

import { useCallback, useEffect, useState } from "react";

function formatAudience(audience) {
  if (Array.isArray(audience)) return audience.join(", ");
  if (typeof audience === "string") return audience;
  return "—";
}

export default function ResultPreview({ draft, loading, celebration = false }) {
  const [prevDraft, setPrevDraft] = useState(null);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  const header = draft?.header ?? {};
  const blocks = draft?.blocks ?? {};

  useEffect(() => {
    if (draft && !loading && draft !== prevDraft) {
      setPrevDraft(draft);
    }
  }, [draft, loading, prevDraft]);

  const getValue = useCallback(
    (key, fallback = "—") => {
      switch (key) {
        case "audience":
          return formatAudience(header.audience ?? draft?.audience);
        case "innovation":
          return (
            header.innovation ?? header.unique ?? draft?.uniqueness ?? fallback
          );
        default:
          return header[key] ?? draft?.[key] ?? fallback;
      }
    },
    [draft, header]
  );

  const blockOrder = [
    { key: "cognitive", title: "Когнитивный блок" },
    { key: "sensory", title: "Сенсорный блок" },
    { key: "branding", title: "Брендинговый блок" },
    { key: "marketing", title: "Маркетинговый блок" }
  ];

  const buildPassportText = useCallback(() => {
    if (!draft) return "";

    const lines = [];

    lines.push("Паспорт уникального продукта");
    lines.push("");
    lines.push(`Категория: ${getValue("category")}`);
    lines.push(`Название: ${getValue("name")}`);
    lines.push(`Целевая аудитория: ${getValue("audience")}`);
    lines.push(`Потребительская боль: ${getValue("pain")}`);
    lines.push(`Уникальность: ${getValue("innovation")}`);
    lines.push("");

    blockOrder.forEach((block) => {
      const rows = Array.isArray(blocks[block.key]) ? blocks[block.key] : [];
      if (!rows.length) return;

      lines.push(`=== ${block.title} ===`);
      rows.forEach((row) => {
        const no = row?.no ? String(row.no).trim() : "";
        const question = row?.question || "";
        const answer = row?.answer || "";

        lines.push("");
        if (no) {
          lines.push(`${no}. ${question}`);
        } else {
          lines.push(question);
        }
        lines.push(answer);
      });
      lines.push("");
    });

    if (draft?.tech) {
      lines.push("=== Технология и состав ===");
      if (Array.isArray(draft.tech)) {
        lines.push(draft.tech.join("\n"));
      } else {
        lines.push(draft.tech);
      }
      lines.push("");
    }

    if (draft?.star) {
      lines.push("=== Почему это звезда? ===");
      if (Array.isArray(draft.star)) {
        lines.push(draft.star.join("\n"));
      } else {
        lines.push(draft.star);
      }
      lines.push("");
    }

    if (draft?.conclusion) {
      lines.push("=== Заключение ===");
      lines.push(draft.conclusion);
      lines.push("");
    }

    return lines.join("\n");
  }, [draft, blocks, getValue]);

  const handleCopy = useCallback(() => {
    const text = buildPassportText();
    if (!text) return;

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
  }, [buildPassportText]);

  const handleDownloadDocx = useCallback(async () => {
    if (!draft) return;

    try {
      setIsDownloadingDocx(true);

      const response = await fetch("/api/passport-docx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ draft })
      });

      if (!response.ok) {
        let message = `DOCX API ${response.status}`;
        try {
          const error = await response.json();
          if (error?.error) {
            message = error.error;
          }
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
      alert(
        error instanceof Error ? error.message : "Не удалось скачать DOCX"
      );
    } finally {
      setIsDownloadingDocx(false);
    }
  }, [draft]);

  const renderPlaceholder = () => {
    if (loading) {
      return (
        <div className="rounded-3xl border border-[#F0D9D2] bg-[#FFF7F4] p-5">
          <div className="space-y-4">
            <div className="h-4 w-36 rounded-full bg-[#F5D9D2]" />
            <div className="h-12 w-full rounded-2xl bg-[#F9E6E1]" />
            <div className="h-12 w-[90%] rounded-2xl bg-[#F9E6E1]" />
            <div className="h-12 w-[82%] rounded-2xl bg-[#F9E6E1]" />
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

  return (
    <aside className="flex flex-col gap-4 md:gap-6 lg:sticky lg:top-32">
      {celebration ? (
        <div className="passport-ready-label rounded-xl md:rounded-3xl p-3 md:p-4 text-center text-xs md:text-sm shadow-sm md:shadow-lg">
          Поздравляем! Вы создали новый продукт!
        </div>
      ) : null}

      <section
        id="full-passport"
        className="floating-panel rounded-xl md:rounded-3xl border border-white/20 bg-white/95 p-4 shadow-sm transition-opacity duration-500 md:p-6 md:shadow-lg"
        aria-live="polite"
        style={{ opacity: draft && !loading ? 1 : 0.98 }}
      >
        <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 border-b border-neutral-200/80 bg-white/95 px-4 pb-4 pt-4 backdrop-blur md:-mx-6 md:-mt-6 md:px-6 md:pb-5 md:pt-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-neutral-900 md:text-2xl">
                Паспорт уникального продукта
              </h2>
              <p className="text-xs text-neutral-600 md:text-sm">
                Когнитивно-сенсорный маркетинговый паспорт по методике «Полярная звезда»
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDownloadDocx}
                disabled={!draft || isDownloadingDocx}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 md:text-base"
              >
                {isDownloadingDocx ? "Готовим DOCX..." : "Скачать DOCX"}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!draft}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#ff5b5b] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#ff7171] disabled:cursor-not-allowed disabled:opacity-40 md:text-base"
              >
                Скопировать паспорт
              </button>
            </div>
          </div>
        </div>

        {!draft ? (
          renderPlaceholder()
        ) : (
          <div id="fp-content" className="flex flex-col gap-4 md:gap-6">
            <div className="space-y-3 md:space-y-4">
              <div className="flex flex-col gap-1 rounded-xl bg-white/70 p-3 shadow-inner md:rounded-2xl md:p-4">
                <span className="text-xs uppercase tracking-wide text-neutral-500">
                  Категория
                </span>
                <strong className="text-base text-neutral-900 transition-opacity duration-300 md:text-lg">
                  {getValue("category")}
                </strong>
              </div>

              <div className="flex flex-col gap-1 rounded-xl bg-white/70 p-3 shadow-inner md:rounded-2xl md:p-4">
                <span className="text-xs uppercase tracking-wide text-neutral-500">
                  Название
                </span>
                <strong className="text-base text-neutral-900 transition-opacity duration-300 md:text-lg">
                  {getValue("name")}
                </strong>
              </div>

              <div className="flex flex-col gap-1 rounded-xl bg-white/70 p-3 shadow-inner md:rounded-2xl md:p-4">
                <span className="text-xs uppercase tracking-wide text-neutral-500">
                  Целевая аудитория
                </span>
                <strong className="text-base text-neutral-900 transition-opacity duration-300 md:text-lg">
                  {getValue("audience")}
                </strong>
              </div>

              <div className="flex flex-col gap-1 rounded-xl bg-white/70 p-3 shadow-inner md:rounded-2xl md:p-4">
                <span className="text-xs uppercase tracking-wide text-neutral-500">
                  Потребительская боль
                </span>
                <strong className="text-base text-neutral-900 transition-opacity duration-300 md:text-lg">
                  {getValue("pain")}
                </strong>
              </div>

              <div className="flex flex-col gap-1 rounded-xl bg-white/70 p-3 shadow-inner md:rounded-2xl md:p-4">
                <span className="text-xs uppercase tracking-wide text-neutral-500">
                  Уникальность
                </span>
                <strong className="text-base text-neutral-900 transition-opacity duration-300 md:text-lg">
                  {getValue("innovation")}
                </strong>
              </div>
            </div>

            {blockOrder.map((block) => {
              const rows = Array.isArray(blocks[block.key]) ? blocks[block.key] : [];
              if (!rows.length) return null;

              return (
                <div
                  key={block.key}
                  className="rounded-xl border border-neutral-200/70 bg-white/80 p-4 shadow-inner md:rounded-3xl md:p-5"
                >
                  <h3 className="text-base font-semibold text-neutral-800 md:text-lg">
                    {block.title}
                  </h3>

                  <div className="mt-3 overflow-x-auto rounded-xl border border-neutral-200/80 md:mt-4 md:rounded-2xl">
                    <table className="min-w-[600px] w-full border-collapse text-xs text-neutral-700 md:min-w-0 md:text-sm">
                      <thead className="bg-neutral-100/80 text-left uppercase tracking-wide text-neutral-500">
                        <tr>
                          <th className="px-2 py-2 md:px-4 md:py-3">№</th>
                          <th className="px-2 py-2 md:px-4 md:py-3">Вопрос</th>
                          <th className="px-2 py-2 md:px-4 md:py-3">Ответ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, index) => (
                          <tr
                            key={`${block.key}-${index}`}
                            className="odd:bg-white even:bg-neutral-50/70"
                          >
                            <td className="px-2 py-2 align-top font-semibold text-neutral-500 md:px-4 md:py-3">
                              {row?.no ?? index + 1}
                            </td>
                            <td className="px-2 py-2 align-top font-medium text-neutral-700 md:px-4 md:py-3">
                              {row?.question || ""}
                            </td>
                            <td className="px-2 py-2 align-top text-neutral-600 md:px-4 md:py-3">
                              {row?.answer || ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            <div className="rounded-xl border border-neutral-200/70 bg-white/80 p-4 shadow-inner md:rounded-3xl md:p-5">
              <h3 className="text-base font-semibold text-neutral-800 md:text-lg">
                Технология и состав
              </h3>
              <p className="mt-2 whitespace-pre-line text-sm text-neutral-700">
                {Array.isArray(draft?.tech)
                  ? draft.tech.join("\n")
                  : draft?.tech || "—"}
              </p>
            </div>
          </div>
        )}
      </section>
    </aside>
  );
}