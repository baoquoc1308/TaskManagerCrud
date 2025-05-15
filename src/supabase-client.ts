import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://eheptazhrsubzaizehvd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoZXB0YXpocnN1YnphaXplaHZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxODk2NjQsImV4cCI6MjA2Mjc2NTY2NH0.D2BWgJZIKpj0sbSzRQIFloHp3gzRFKjD1gEbDiBEAxY"
);
