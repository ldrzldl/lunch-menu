// This is a publishable browser key. Row Level Security must protect the tables.
export const SUPABASE_URL = 'https://dxedpmgowlqanderfsww.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_YOUFNzpV2qyBXaB01aEN3Q_unvX4BYd';

export function getSupabaseClient() {
  if (typeof window === 'undefined' || !window.supabase?.createClient) return null;
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}
