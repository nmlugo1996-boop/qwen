import dynamic from "next/dynamic";

const HomeClient = dynamic(() => import("../../components/HomeClient"), {
  ssr: false,
});

export default function GeneratorPage() {
  return (
    <section className="relative mt-6">
      <HomeClient />
    </section>
  );
}