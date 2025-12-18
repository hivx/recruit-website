// src/components/StatusBadge.tsx
interface StatusBadgeProps {
  readonly status: string | null | undefined;
}

const MAP: Record<string, string> = {
  submitted: "bg-yellow-100 text-yellow-700",
  verified: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
        status ? MAP[status] : "bg-gray-100 text-gray-600"
      }`}
    >
      {status ?? "Chưa xác định"}
    </span>
  );
}
