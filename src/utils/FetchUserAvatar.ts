import { supabase } from "../supabase-client";

export async function fetchUserAvatar(email: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("users")
    .select("avatar")
    .eq("email", email)
    .single();

  if (error) {
    console.error("Error fetching avatar:", error);
    return null;
  }
  return data?.avatar || null;
}
