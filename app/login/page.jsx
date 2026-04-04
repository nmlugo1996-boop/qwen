"use client";

import Link from "next/link";
import { useState } from "react";
import { createBrowserClient } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabase = createBrowserClient();

      if (!supabase) {
        throw new Error("Supabase не настроен");
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        throw error;
      }

      setMessage(
        "Ссылка для входа отправлена на почту. Открой письмо и перейди по ссылке."
      );
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Не удалось отправить ссылку для входа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#eef3f9] px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:border-slate-400"
          >
            В главное меню
          </Link>
        </div>

        <div className="rounded-[36px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
          <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
            Вход в личный кабинет
          </h1>

          <p className="mt-3 text-base text-slate-600">
            Введи email. На него придёт ссылка для входа.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <div className="rounded-[28px] border border-slate-200 bg-white px-3 py-3 shadow-[0_8px_25px_rgba(15,23,42,0.04)]">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent px-2 py-2 text-base text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-[28px] border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:border-slate-400 disabled:opacity-50"
            >
              {loading ? "Отправляем..." : "Получить ссылку для входа"}
            </button>
          </form>

          {message ? (
            <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {message}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}