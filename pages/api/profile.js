import { adminClient, supaServer } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({ error: "Нет токена авторизации" });
    }

    const supabase = supaServer();
    if (!supabase) {
      return res.status(500).json({ error: "Supabase не настроен" });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Пользователь не авторизован" });
    }

    const admin = adminClient();
    if (!admin) {
      return res.status(500).json({ error: "Admin client не настроен" });
    }

    const { data: existing, error: selectError } = await admin
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (selectError) {
      console.error(selectError);
      return res.status(500).json({ error: "Ошибка чтения профиля" });
    }

    if (existing) {
      return res.status(200).json(existing);
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: "user",
      access_status: "pending",
    };

    const { data: inserted, error: insertError } = await admin
      .from("users")
      .insert(payload)
      .select("*")
      .single();

    if (insertError) {
      console.error(insertError);
      return res.status(500).json({ error: "Ошибка создания профиля" });
    }

    return res.status(200).json(inserted);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}