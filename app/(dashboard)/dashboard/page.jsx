"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "../../../lib/supabaseClient";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = createBrowserClient();
        if (!supabase) {
          throw new Error("Supabase не настроен");
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          setLoading(false);
          return;
        }

        setSessionUser(session.user);

        const response = await fetch("/api/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Ошибка загрузки профиля");
        }

        setProfile(data);
      } catch (error) {
        console.error(error);
        setErrorText(error.message || "Не удалось загрузить профиль");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createBrowserClient();
      if (!supabase) return;
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert("Не удалось выйти");
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-14 text-white">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          Загрузка кабинета...
        </div>
      </main>
    );
  }

  if (!sessionUser) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-14 text-white">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h1 className="text-3xl font-extrabold">Личный кабинет</h1>
          <p className="mt-3 text-white/70">Ты ещё не вошёл в систему.</p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-black"
          >
            Перейти ко входу
          </Link>
        </div>
      </main>
    );
  }

  const statusText =
    {
      pending: "Ожидает активации",
      active: "Активен",
      blocked: "Заблокирован",
    }[profile?.access_status] || "Неизвестно";

  return (
    <main className="mx-auto max-w-3xl px-4 py-14 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h1 className="text-3xl font-extrabold">Личный кабинет</h1>

        {errorText ? (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {errorText}
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm text-white/60">Email</div>
            <div className="mt-1 text-lg font-semibold">{sessionUser.email}</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm text-white/60">Роль</div>
            <div className="mt-1 text-lg font-semibold">{profile?.role || "user"}</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm text-white/60">Статус доступа</div>
            <div className="mt-1 text-lg font-semibold">{statusText}</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-white/80">
            {profile?.access_status === "active"
              ? "Доступ к генерации открыт."
              : "Доступ к генерации пока не выдан. Его включает администратор."}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/#generator"
            className="rounded-xl bg-white px-5 py-3 font-semibold text-black"
          >
            К генератору
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white"
          >
            Выйти
          </button>
        </div>
      </div>
    </main>
  );
}