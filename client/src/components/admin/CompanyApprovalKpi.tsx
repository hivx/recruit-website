// src/components/admin/CompanyApprovalKpi.tsx
import { useListCompanies } from "@/hooks/useMyCompany";

export function CompanyApprovalKpi() {
  const { data } = useListCompanies({ page: 1, limit: 1000 });

  if (!data) {
    return null;
  }

  let submitted = 0;
  let verified = 0;
  let rejected = 0;

  for (const c of data.companies) {
    const s = c.verification?.status;
    if (s === "verified") {
      verified++;
    } else if (s === "rejected") {
      rejected++;
    } else {
      submitted++;
    }
  }

  return (
    <>
      <KpiCard
        label="Đang chờ xử lý"
        value={submitted}
        color="yellow"
        hint="Cần admin xem xét"
      />
      <KpiCard
        label="Đã duyệt"
        value={verified}
        color="green"
        hint="Đang hoạt động"
      />
      <KpiCard
        label="Từ chối"
        value={rejected}
        color="red"
        hint="Không đủ điều kiện"
      />
    </>
  );
}

function KpiCard({
  label,
  value,
  color,
  hint,
}: {
  readonly label: string;
  readonly value: number;
  readonly hint?: string;
  readonly color: "green" | "yellow" | "red";
}) {
  const colorMap = {
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className={`rounded-xl p-4 ${colorMap[color]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      {hint && <p className="text-xs opacity-70 mt-1">{hint}</p>}
    </div>
  );
}
