import { supabase } from "../supabase-client";

export const uploadImage = async (file: File): Promise<string | null> => {
  const filePath = `${file.name}-${Date.now()}`;

  const { error } = await supabase.storage
    .from("tasks-images")
    .upload(filePath, file);

  if (error) {
    console.error("Error uploading image:", error.message);
    return null;
  }

  const { data } = await supabase.storage
    .from("tasks-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
};
