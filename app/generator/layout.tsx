import "../../styles/globals.css";
import Header from "../../components/Header";

const BUILD_SHA = process.env.VERCEL_GIT_COMMIT_SHA || "local";

export default function GeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[url('/bg-meats.webp')] bg-cover bg-center md:bg-fixed" />
        <div className="absolute inset-0 bg-black/45 backdrop-blur-sm md:backdrop-blur-md lg:backdrop-blur-lg" />
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_10%,transparent_35%,transparent_65%,black_95%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />

        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 py-6 md:gap-10 md:px-6 md:py-12 lg:py-16">
          {children}
        </main>

        <footer className="mx-auto w-full max-w-6xl px-3 pb-4 text-xs text-neutral-400 md:px-6 md:pb-6">
          build: {BUILD_SHA.slice(0, 7)}
        </footer>
      </div>

      <div
        id="toast"
        className="toast"
        role="status"
        aria-live="assertive"
        aria-atomic="true"
      />
    </>
  );
}