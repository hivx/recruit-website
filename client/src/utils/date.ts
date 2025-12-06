// src/utils/date.ts
export function formatDateDMY(date?: string | null): string {
  if (!date) {
    return "Chưa cập nhật";
  }

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    return "Không hợp lệ";
  }

  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();

  return `${day}-${month}-${year}`;
}
