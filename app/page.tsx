import Image from "next/image";
import Link from "next/link";
import { ActionCard } from "@/components/home/ActionCard";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#eef3f9] text-[#0f172a]">
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_30%)]" />
        <div className="absolute left-[-6%] top-[8%] h-[320px] w-[320px] rounded-full bg-red-300/16 blur-[110px]" />
        <div className="absolute right-[-8%] top-[10%] h-[340px] w-[340px] rounded-full bg-sky-300/18 blur-[120px]" />
        <div className="absolute bottom-[-8%] left-[35%] h-[260px] w-[260px] rounded-full bg-violet-200/16 blur-[120px]" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 pb-10 pt-8 md:px-10 md:pb-12 md:pt-10 lg:px-16">
          <section className="w-full">
            <div className="grid items-start gap-6 lg:grid-cols-[180px_minmax(0,1fr)_auto] lg:gap-8">
              <div className="flex justify-start">
                <Image
                  src="/polarstar-logo.png"
                  alt="Polar Star"
                  width={180}
                  height={180}
                  className="h-[150px] w-[150px] object-contain md:h-[170px] md:w-[170px]"
                  priority
                />
              </div>

              <div className="pt-4 md:pt-6 lg:pt-8">
                <h1 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.02em] text-[#0f172a] md:text-[52px]">
                  Начните работу с инструментом
                </h1>

                <p className="mt-5 max-w-4xl text-base leading-8 text-slate-600 md:text-lg">
                  Выберите один из двух режимов работы: разработка уникального
                  продукта или сравнительный анализ двух продуктов по методике
                  когнитивно-сенсорного маркетинга.
                </p>
              </div>

              <div className="flex justify-start lg:justify-end">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.10)] transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
                >
                  Войти
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-10 grid gap-7 lg:mt-12 lg:grid-cols-2">
            <ActionCard
              href="/generator"
              accent="red"
              title="Разработать уникальный продукт"
              description="Перейти в основной генератор и пошагово собрать новый продукт по методике когнитивно-сенсорного маркетинга."
            />

            <ActionCard
              href="/analysis"
              accent="blue"
              title="Сделать сравнительный анализ двух продуктов"
              description="Открыть страницу анализа, заполнить оценки по критериям и построить диаграмму прямо на сайте."
            />
          </section>
        </div>
      </div>
    </main>
  );
}