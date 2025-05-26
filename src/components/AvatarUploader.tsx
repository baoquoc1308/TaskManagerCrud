import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import { uploadImage } from "../utils/UploadImage";

interface AvatarUploaderProps {
  userId: string;
  onAvatarChange?: (url: string) => void; // Gửi ngược lên Header
}

export default function AvatarUploader({
  userId,
  onAvatarChange,
}: AvatarUploaderProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAvatar = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("avatar_url")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Lỗi khi lấy avatar:", error.message);
        return;
      }

      setAvatarUrl(data?.avatar_url || null);
    };

    fetchAvatar();
  }, [userId]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const publicUrl = await uploadImage(file);
    if (!publicUrl) {
      alert("Upload thất bại!");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("tasks")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    if (error) {
      console.error("Lỗi khi cập nhật avatar_url:", error.message);
    } else {
      setAvatarUrl(publicUrl);
      onAvatarChange?.(publicUrl); // Gửi về cha nếu cần
    }

    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <label htmlFor="avatar-upload">
        <img
          src={
            avatarUrl ||
            "https://ui-avatars.com/api/?name=User&background=random"
          }
          alt="Avatar"
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            objectFit: "cover",
            cursor: "pointer",
            border: "2px solid #ccc",
          }}
        />
      </label>

      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
        disabled={loading}
      />

      {loading && <p>Đang tải lên...</p>}
    </div>
  );
}
