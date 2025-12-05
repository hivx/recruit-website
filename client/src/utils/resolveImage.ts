export function resolveImage(src?: string | null): string {
  const base = String(import.meta.env.VITE_API_URL);

  // fallback khi không có ảnh
  if (!src || src.trim() === "") {
    return `${base.replace(/\/$/, "")}/uploads/pic.jpg`;
  }

  // Nếu BE trả relative path → convert thành absolute
  if (!src.startsWith("http")) {
    return `${base.replace(/\/$/, "")}/${src}`;
  }

  return src;
}
