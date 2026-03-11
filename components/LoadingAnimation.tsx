"use client";

import { useEffect, useMemo, useState } from "react";

interface LoadingAnimationProps {
  isVisible: boolean;
}

type Particle = {
  id: number;
  x: number;
  y: number;
  delay: number;
  size: number;
};

type Stage = {
  id: number;
  title: string;
  description: string;
  icon: string;
  threshold: number;
};

const STAGES: Stage[] = [
  {
    id: 1,
    title: "Генерирую продукт",
    description: "Собираю новую продуктовую форму внутри категории.",
    icon: "⚙️",
    threshold: 0
  },
  {
    id: 2,
    title: "Собираю маркетинговую логику",
    description: "Проверяю боль, аудиторию, уникальность и сценарий потребления.",
    icon: "🧠",
    threshold: 28
  },
  {
    id: 3,
    title: "Формирую паспорт",
    description: "Заполняю когнитивный, сенсорный, брендинговый и маркетинговый блоки.",
    icon: "📋",
    threshold: 58
  },
  {
    id: 4,
    title: "Готовлю документ",
    description: "Финализирую структуру и собираю итоговый результат.",
    icon: "📄",
    threshold: 82
  }
];

export default function LoadingAnimation({ isVisible }: LoadingAnimationProps) {
  const [progress, setProgress] = useState<number>(0);
  const [dots, setDots] = useState<string>("");
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showExitFlash, setShowExitFlash] = useState<boolean>(false);

  useEffect(() => {
    if (!isVisible) {
      setParticles([]);
      return;
    }

    const nextParticles: Particle[] = Array.from({ length: 18 }, (_, i) => ({
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
        }, 450);

        return () => clearTimeout(t);
      }

      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;

        if (prev < 20) return prev + Math.random() * 4.2;
        if (prev < 45) return prev + Math.random() * 3.3;
        if (prev < 70) return prev + Math.random() * 2.4;
        return prev + Math.random() * 1.2;
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
    <div className="fixed top-4 left-1/2 z-[70] w-[min(980px,calc(100vw-24px))] -translate-x-1/2 px-0">
      <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-xl">
        {showExitFlash ? (
          <div className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-r from-[#FF8A7A]/20 via-white/40 to-[#FF6B5B]/20" />
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)]">
          <div className="relative overflow-hidden border-b border-neutral-200/70 bg-[#FFF4F1] md:border-b-0 md:border-r">
            <div className="absolute inset-0">
              {particles.map((particle) => (
                <span
                  key={particle.id}
                  className="absolute rounded-full bg-[#FF8A7A]/40"
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
              <div className="mb-6 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-[#7A3A34] shadow-sm">
                {currentStage.icon} {currentStage.title}
              </div>

              <div className="relative flex h-32 w-32 items-center justify-center">
                <div className="absolute h-32 w-32 rounded-full border border-[#FFB8AD]/40" />
                <div className="absolute h-24 w-24 rounded-full border border-[#FF9A8A]/35" />
                <div className="absolute h-16 w-16 rounded-full border border-[#FF7B68]/30" />
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#FF9C8A] via-[#FF7C6A] to-[#FF5B5B] shadow-[0_0_30px_rgba(255,107,91,0.35)]" />
                <div className="absolute h-6 w-6 rounded-full bg-white/90" />
              </div>
            </div>
          </div>

          <div className="px-6 py-6 md:px-8 md:py-7">
            <div className="flex flex-col gap-2">
              <p className="text-sm uppercase tracking-[0.22em] text-neutral-400">
                Идёт генерация
              </p>
              <h2 className="max-w-[640px] text-2xl font-semibold leading-tight text-neutral-900 md:text-[42px] md:leading-[1.02]">
                Собираю новый продуктовый объект
              </h2>
              <p className="max-w-[680px] text-base text-neutral-500 md:text-[18px]">
                {currentStage.description}
              </p>
            </div>

            <div className="mt-6">
              <div className="relative h-3 overflow-hidden rounded-full bg-[#F4D9D3]">
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

            <div className="mt-5 rounded-3xl bg-[#FFF3F0] px-5 py-4">
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
                        ? "border-[#FF9B8A] bg-[#FFF5F2] shadow-[0_6px_20px_rgba(255,120,100,0.12)]"
                        : isDone
                          ? "border-[#F0D5CF] bg-white"
                          : "border-neutral-200 bg-white/70"
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
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes floatParticle {
          0% {
            transform: translateY(0px) scale(0.9);
            opacity: 0.25;
          }
          50% {
            transform: translateY(-12px) scale(1.15);
            opacity: 0.65;
          }
          100% {
            transform: translateY(0px) scale(0.9);
            opacity: 0.25;
          }
        }
      `}</style>
    </div>
  );
}