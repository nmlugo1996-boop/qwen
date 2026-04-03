import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function createBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase browser env not found");
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export function supaServer() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase server env not found");
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export function adminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Supabase admin env not found");
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey);
}