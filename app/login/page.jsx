"use client";

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

      setMessage("Ссылка для входа отправлена на почту. Открой письмо и перейди по ссылке.");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Не удалось отправить ссылку для входа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-14 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h1 className="text-3xl font-extrabold">Вход в личный кабинет</h1>
        <p className="mt-3 text-white/70">
          Введи email. На него придёт ссылка для входа.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-white/80">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-white/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Отправляем..." : "Получить ссылку для входа"}
          </button>
        </form>

        {message ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/85">
            {message}
          </div>
        ) : null}
      </div>
    </main>
  );
}