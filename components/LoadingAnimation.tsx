"use client";

import { useEffect, useMemo, useState } from "react";

type LoadingAnimationProps = {
  isVisible: boolean;
};

type Stage = {
  id: string;
  title: string;
  description: string;
  threshold: number;
  icon: string;
};

type Particle = {
  id: number;
  x: number;
  y: number;
  delay: number;
  size: number;
};

const STAGES: Stage[] = [
  {
    id: "concept",
    title: "Концепт",
    description: "Придумываю новый продукт и форм-фактор",
    threshold: 0,
    icon: "🧩"
  },
  {
    id: "novelty",
    title: "Новизна",
    description: "Фиксирую, в чём инновация и почему попробуют",
    threshold: 22,
    icon: "✨"
  },
  {
    id: "passport",
    title: "Паспорт",
    description: "Собираю когнитивный и сенсорный блоки",
    threshold: 46,
    icon: "🧠"
  },
  {
    id: "brand",
    title: "Бренд",
    description: "Собираю брендинговую и маркетинговую логику",
    threshold: 68,
    icon: "🏷️"
  },
  {
    id: "final",
    title: "Финал",
    description: "Делаю итоговый паспорт и проверяю структуру",
    threshold: 88,
    icon: "✅"
  }
];

export default function LoadingAnimation({
  isVisible
}: LoadingAnimationProps) {
  const [progress, setProgress] = useState<number>(0);
  const [dots, setDots] = useState<string>("");
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showExitFlash, setShowExitFlash] = useState<boolean>(false);

  useEffect(() => {
    if (!isVisible) {
      setParticles([]);
      return;
    }

    const nextParticles: Particle[] = Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2.2,
      size: Math.random() * 6 + 4
    }));

    setParticles(nextParticles);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) {
      if (progress > 0) {
        setProgress(100);
        setShowExitFlash(true);

        const t = setTimeout(() => {
          setShowExitFlash(false);
          setProgress(0);
        }, 420);

        return () => clearTimeout(t);
      }

      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;

        if (prev < 20) return prev + Math.random() * 4.2;
        if (prev < 45) return prev + Math.random() * 3.1;
        if (prev < 70) return prev + Math.random() * 2.2;
        return prev + Math.random() * 1.1;
      });
    }, 260);

    return () => clearInterval(interval);
  }, [isVisible, progress]);

  useEffect(() => {
    if (!isVisible) {
      setDots("");
      return;
    }

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isVisible]);

  const currentStage = useMemo(() => {
    const sorted = [...STAGES].reverse();
    return sorted.find((stage) => progress >= stage.threshold) ?? STAGES[0];
  }, [progress]);

  const progressLabel = Math.max(8, Math.min(99, Math.round(progress)));

  if (!isVisible && !showExitFlash) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      {/* Плотный фон, почти не просвечивает сайт */}
      <div className="absolute inset-0 bg-[rgba(248,244,242,0.94)]" />

      {/* Очень мягкий декоративный градиент вместо стеклянной прозрачности */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,120,100,0.10),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,160,130,0.08),transparent_30%)]" />

      <div className="absolute top-4 left-1/2 z-[81] w-[min(980px,calc(100vw-24px))] -translate-x-1/2 px-0">
        <div className="relative overflow-hidden rounded-[28px] border border-[#E8D7D1] bg-[#FFFDFC] shadow-[0_24px_70px_rgba(0,0,0,0.12)]">
          {showExitFlash ? (
            <div className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-r from-[#FF8A7A]/10 via-white/35 to-[#FF6B5B]/10" />
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)]">
            {/* Левая колонка */}
            <div className="relative overflow-hidden border-b border-[#E8D7D1] bg-[#FFF4F1] md:border-b-0 md:border-r">
              <div className="absolute inset-0">
                {particles.map((particle) => (
                  <span
                    key={particle.id}
                    className="absolute rounded-full bg-[#FF8A7A]/35"
                    style={{
                      left: `${particle.x}%`,
                      top: `${particle.y}%`,
                      width: `${particle.size}px`,
                      height: `${particle.size}px`,
                      animation: `floatParticle ${3.4 + particle.delay}s ease-in-out ${particle.delay}s infinite`
                    }}
                  />
                ))}
              </div>

              <div className="relative flex h-full min-h-[230px] flex-col items-center justify-center px-6 py-8">
                <div className="mb-6 rounded-full border border-[#F2D6CF] bg-white px-4 py-2 text-sm font-medium text-[#7A3A34] shadow-sm">
                  {currentStage.icon} {currentStage.title}
                </div>

                <div className="relative flex h-32 w-32 items-center justify-center">
                  <div className="absolute h-32 w-32 rounded-full border border-[#F5C8BE]" />
                  <div className="absolute h-24 w-24 rounded-full border border-[#F6B7A9]" />
                  <div className="absolute h-16 w-16 rounded-full border border-[#F89D8C]" />
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#FF9C8A] via-[#FF7C6A] to-[#FF5B5B] shadow-[0_0_24px_rgba(255,107,91,0.25)]" />
                  <div className="absolute h-6 w-6 rounded-full bg-white" />
                </div>
              </div>
            </div>

            {/* Правая колонка */}
            <div className="bg-[#FFFCFB] px-6 py-6 md:px-8 md:py-7">
              <div className="flex flex-col gap-2">
                <p className="text-sm uppercase tracking-[0.22em] text-neutral-400">
                  Идёт генерация
                </p>
                <h2 className="max-w-[640px] text-2xl font-semibold leading-tight text-neutral-900 md:text-[42px] md:leading-[1.02]">
                  Собираю новый продуктовый объект
                </h2>
                <p className="max-w-[680px] text-base text-neutral-600 md:text-[18px]">
                  {currentStage.description}
                </p>
              </div>

              <div className="mt-6">
                <div className="relative h-3 overflow-hidden rounded-full bg-[#F1D6CF]">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#FF6159] to-[#FF9B7A] transition-all duration-500 ease-out"
                    style={{ width: `${progressLabel}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-neutral-500">
                  <span>Идёт генерация{dots}</span>
                  <span>{progressLabel}%</span>
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-[#F0DDD7] bg-[#FFF3F0] px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                  Сейчас происходит
                </p>
                <p className="mt-2 text-lg text-neutral-700">
                  {currentStage.description}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                {STAGES.map((stage, index) => {
                  const isDone = progress >= stage.threshold + 14;
                  const isActive = currentStage.id === stage.id;

                  return (
                    <div
                      key={stage.id}
                      className={[
                        "rounded-3xl border px-4 py-4 transition-all duration-300",
                        isActive
                          ? "border-[#FFB09E] bg-[#FFF5F2] shadow-[0_8px_20px_rgba(255,120,100,0.10)]"
                          : isDone
                            ? "border-[#EAD7D0] bg-white"
                            : "border-[#EEE2DD] bg-[#FFFCFB]"
                      ].join(" ")}
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                        Этап {index + 1}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[18px] text-neutral-700">
                        <span>{stage.icon}</span>
                        <span className={isActive ? "font-semibold text-neutral-900" : ""}>
                          {stage.title}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-snug text-neutral-500">
                        {stage.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes floatParticle {
          0% {
            transform: translateY(0px) scale(0.9);
            opacity: 0.22;
          }
          50% {
            transform: translateY(-12px) scale(1.12);
            opacity: 0.55;
          }
          100% {
            transform: translateY(0px) scale(0.9);
            opacity: 0.22;
          }
        }
      `}</style>
    </div>
  );
}