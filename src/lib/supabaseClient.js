import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://encwlxkvhlblxkadqvgz.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuY3dseGt2aGxibHhrYWRxdmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzU4OTIsImV4cCI6MjA3NTI1MTg5Mn0.2SAubnKPfaGPGgpGKPFfgLQuXcKUXINYyNe-Ulzwk_M";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
