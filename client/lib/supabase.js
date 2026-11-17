// The browser talks to Supabase directly ONLY for auth (sign up, sign in, sign out).
// All data goes through our Flask API — see lib/api.js.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Lets the app render in "preview mode" before anyone has filled in .env.local.
export const supabaseConfigured = Boolean(url && anonKey);

export const supabase = supabaseConfigured ? createClient(url, anonKey) : null;
