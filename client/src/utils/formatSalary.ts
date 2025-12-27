// src/utils/formatSalary.ts
export function formatSalary(
  min?: number | null,
  max?: number | null,
): string | null {
  if (min && max) {
    return `${min.toLocaleString()} - ${max.toLocaleString()} VND`;
  }
  if (min) {
    return `${min.toLocaleString()} VND`;
  }
  if (max) {
    return `${max.toLocaleString()} VND`;
  }
  return null;
}
