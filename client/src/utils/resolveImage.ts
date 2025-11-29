export function resolveImage(path?: string | null) {
  if (!path) {
    return "/placeholder-avatar.png";
  }

  // convert ENV về string an toàn
  const base = String(import.meta.env.VITE_API_URL).replace(/\/$/, "");

  const cleanPath = path.replace(/^\//, "");

  return `${base}/${cleanPath}`;
}
