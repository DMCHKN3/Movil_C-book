import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_API_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);