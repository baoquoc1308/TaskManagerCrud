import { supabase } from "../supabase-client";

export const getUserInfo = async () => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    console.error("No session or user found");
    return { userId: null, role: null };
  }

  const userId = session.user.id;
  const email = session.user.email;

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("email", email)
    .single();

  if (error) {
    console.error("Error fetching user role:", error.message);
    return { userId, role: "user" };
  }

  return { userId, role: data?.role || "user" };
};
