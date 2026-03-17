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

const STAGES: Stage[] = [
  { id: "a", title: "Концепт", description: "Придумываю новый продукт и форм-фактор", threshold: 0, icon: "🧩" },
  { id: "b", title: "Новизна", description: "Фиксирую, в чём инновация и почему попробуют", threshold: 26, icon: "✨" },
  { id: "c", title: "Паспорт", description: "Собираю когнитивный и сенсорный блоки", threshold: 52, icon: "🧠" },
  { id: "d", title: "Бренд", description: "Собираю брендинговую и маркетинговую логику", threshold: 74, icon: "🏷️" },
  { id: "e", title: "Финал", description: "Делаю итоговый паспорт и проверяю структуру", threshold: 90, icon: "✅" }
];

type Particle = {
  id: string;
  x: number;
  y: number;
  size: number;
  delay: number;
};

const buildParticles = () => {
  const count = 12;
  const list: Particle[] = [];
  for (let i = 0; i < count; i += 1) {
    list.push({
      id: `p-${i}-${Math.random().toString(16).slice(2)}`,
      x: Math.round(Math.random() * 90) + 5,
      y: Math.round(Math.random() * 80) + 10,
      size: Math.round(Math.random() * 8) + 6,
      delay: Math.random() * 2.6
    });
  }
  return list;
};

export default function LoadingAnimation({ isVisible }: LoadingAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");
  const [particles] = useState<Particle[]>(() => buildParticles());

  const [mounted, setMounted] = useState(false);
  const [showExitFlash, setShowExitFlash] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setMounted(true);
      setShowExitFlash(false);
      setProgress(0);
      return;
    }

    if (mounted) {
      setShowExitFlash(true);
      const t1 = setTimeout(() => setShowExitFlash(false), 520);
      const t2 = setTimeout(() => setMounted(false), 560); // дождаться fade-out
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isVisible, mounted]);

  useEffect(() => {
    if (!isVisible) return;

    let raf: number | null = null;
    let start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;

      // плавное приближение к 95%, чтобы не “доскакать” до 100%
      const target = Math.min(95, 8 + (elapsed / 1000) * 12);
      setProgress((prev) => {
        const next = prev + (target - prev) * 0.10;
        return Math.min(99, next);
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) {
      setDots("");
      return;
    }

    const interval = setInterval(() => {
      setDots((prev) => (prev === "..." ? "" : prev + "."));
    }, 450);

    return () => clearInterval(interval);
  }, [isVisible]);

  const currentStage = useMemo(() => {
    const sorted = [...STAGES].reverse();
    return sorted.find((stage) => progress >= stage.threshold) ?? STAGES[0];
  }, [progress]);

  const progressLabel = Math.max(8, Math.min(99, Math.round(progress)));

  if (!mounted) return null;

  return (
    <>
      {/* Мягкий фон/бэкдроп */}
      <div
        className={[
          "fixed inset-0 z-[65] bg-white/55 backdrop-blur-sm transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0"
        ].join(" ")}
      />

      {/* Панель */}
      <div
        className={[
          "fixed top-4 left-1/2 z-[70] w-[min(980px,calc(100vw-24px))] -translate-x-1/2",
          "transition-all duration-300 ease-out",
          isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-[0.985]"
        ].join(" ")}
      >
        <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/92 shadow-[0_24px_80px_rgba(0,0,0,0.14)] backdrop-blur-xl">
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
                <div className="mb-6 rounded-full bg-white/75 px-4 py-2 text-sm font-medium text-[#7A3A34] shadow-sm">
                  {currentStage.icon} {currentStage.title}
                </div>

                <div className="relative flex h-32 w-32 items-center justify-center">
                  <div className="absolute h-32 w-32 rounded-full border border-[#FFB8AD]/40" />
                  <div className="absolute h-24 w-24 rounded-full border border-[#FF9A8A]/35" />
                  <div className="absolute h-16 w-16 rounded-full border border-[#FF7B68]/30" />
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#FF9C8A] via-[#FF7C6A] to-[#FF5B5B] shadow-[0_0_34px_rgba(255,107,91,0.35)]" />
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
                {STAGES.map((stage) => {
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
                            ? "border-neutral-200/70 bg-white/85"
                            : "border-neutral-200/50 bg-white/60"
                      ].join(" ")}
                    >
                      <p className="text-sm font-semibold text-neutral-800">
                        {stage.icon} {stage.title}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        {stage.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <style jsx>{`
            @keyframes floatParticle {
              0% {
                transform: translateY(0);
                opacity: 0.45;
              }
              50% {
                transform: translateY(-14px);
                opacity: 0.9;
              }
              100% {
                transform: translateY(0);
                opacity: 0.45;
              }
            }
          `}</style>
        </div>
      </div>
    </>
  );
}