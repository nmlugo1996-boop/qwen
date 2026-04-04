import "../styles/globals.css";

export const metadata = {
  title: "Qwen Chi",
  description:
    "Генератор уникальных продуктов по методике когнитивно-сенсорного маркетинга",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-[#eef3f9] text-[#111827]">
        {children}
      </body>
    </html>
  );
}