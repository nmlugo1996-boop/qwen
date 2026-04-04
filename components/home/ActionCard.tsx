import Link from "next/link";

type ActionCardProps = {
  href: string;
  title: string;
  description: string;
  accent: "red" | "blue";
};

export function ActionCard({
  href,
  title,
  description,
  accent,
}: ActionCardProps) {
  const accentStyles =
    accent === "red"
      ? {
          border: "border-red-200/80 hover:border-red-300",
          glow: "from-red-400/14 via-orange-300/10 to-transparent",
          button:
            "border-red-200 bg-white/88 text-red-600 group-hover:bg-red-50 group-hover:border-red-300",
          dot: "bg-red-400 shadow-[0_0_28px_rgba(248,113,113,0.4)]",
          title: "text-[#101828]",
          text: "text-slate-600",
          shadow:
            "shadow-[0_18px_60px_rgba(15,23,42,0.06)] hover:shadow-[0_24px_70px_rgba(239,68,68,0.12)]",
          bg: "bg-[linear-gradient(180deg,rgba(255,248,248,0.94),rgba(255,255,255,0.97))]",
        }
      : {
          border: "border-sky-200/80 hover:border-sky-300",
          glow: "from-sky-300/16 via-cyan-200/10 to-transparent",
          button:
            "border-sky-200 bg-white/88 text-sky-700 group-hover:bg-sky-50 group-hover:border-sky-300",
          dot: "bg-sky-400 shadow-[0_0_28px_rgba(56,189,248,0.4)]",
          title: "text-[#101828]",
          text: "text-slate-600",
          shadow:
            "shadow-[0_18px_60px_rgba(15,23,42,0.06)] hover:shadow-[0_24px_70px_rgba(14,165,233,0.12)]",
          bg: "bg-[linear-gradient(180deg,rgba(245,251,255,0.94),rgba(255,255,255,0.97))]",
        };

  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-[36px] border ${accentStyles.border} ${accentStyles.bg} p-8 transition duration-300 ease-out hover:-translate-y-1.5 ${accentStyles.shadow}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accentStyles.glow} opacity-100`}
      />

      <div className="absolute inset-x-0 top-0 h-px bg-white/80" />

      <div className="relative z-10 flex min-h-[310px] flex-col justify-between">
        <div>
          <div className="mb-7 flex items-center">
            <div className={`h-4 w-4 rounded-full ${accentStyles.dot}`} />
          </div>

          <h3
            className={`max-w-[30rem] text-[31px] font-semibold leading-[1.08] tracking-[-0.02em] ${accentStyles.title}`}
          >
            {title}
          </h3>

          <p
            className={`mt-6 max-w-[34rem] text-[17px] leading-8 ${accentStyles.text}`}
          >
            {description}
          </p>
        </div>

        <div className="mt-10 flex items-center gap-4">
          <span
            className={`inline-flex items-center rounded-full border px-5 py-3 text-sm font-medium transition ${accentStyles.button}`}
          >
            Открыть
          </span>

          <span className="text-2xl text-slate-400 transition duration-300 group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}