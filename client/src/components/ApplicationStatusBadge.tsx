// src/components/ApplicationStatusBadge.tsx
interface ApplicantStatusProps {
  readonly status: string | null | undefined;
}

const MAP: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  approved: "bg-green-100 text-green-700 border border-green-200",
  rejected: "bg-red-100 text-red-700 border border-red-200",
};

export function ApplicationStatusBadge({ status }: ApplicantStatusProps) {
  const cls = status
    ? (MAP[status] ?? "bg-gray-100 text-gray-600")
    : "bg-gray-100 text-gray-600";

  return (
    <span
      className={`
        px-3 py-1 rounded-full text-xs font-medium
        ${cls}
      `}
    >
      {status ?? "Unknown"}
    </span>
  );
}
