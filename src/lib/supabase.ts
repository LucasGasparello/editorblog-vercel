import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ?? "https://zoyjotnvxfcelzgvhwnh.supabase.co",
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpveWpvdG52eGZjZWx6Z3Zod25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjk2ODAsImV4cCI6MjA5Mzc0NTY4MH0.BPkqD-fe6E48W8wC8Od49-enX9arJePqoO0z4ZNmOlU",
);
