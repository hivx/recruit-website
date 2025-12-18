// src/components/admin/JobApprovalChart.tsx
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import type { TooltipItem } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import type { Job } from "@/types";

ChartJS.register(ArcElement, Tooltip, Legend);

function buildApprovalStats(jobs: Job[]) {
  let approved = 0;
  let rejected = 0;
  let pending = 0;

  for (const job of jobs) {
    const status = job.approval?.status;

    if (status === "approved") {
      approved++;
    } else if (status === "rejected") {
      rejected++;
    } else {
      pending++;
    }
  }

  const total = approved + rejected + pending;

  return { approved, rejected, pending, total };
}

export function JobApprovalCountChart({
  jobs,
  title = "Trạng thái duyệt bài đăng",
}: {
  readonly jobs: Job[];
  readonly title?: string;
}) {
  const stats = buildApprovalStats(jobs);

  const chartData = {
    labels: ["Chưa duyệt", "Đã duyệt", "Đã từ chối"],
    datasets: [
      {
        data: [stats.pending, stats.approved, stats.rejected],
        backgroundColor: ["#facc15", "#22c55e", "#ef4444"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"doughnut">) =>
            `${ctx.label}: ${ctx.parsed}`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Chart */}
        <div className="lg:col-span-2">
          <div className="relative h-72">
            <Doughnut data={chartData} options={options} />
          </div>
        </div>

        {/* KPI */}
        <div className="space-y-3">
          <KpiCard label="Số bài đăng" value={stats.total} tone="gray" />
          <KpiCard label="Chưa duyệt" value={stats.pending} tone="yellow" />
          <KpiCard label="Đã duyệt" value={stats.approved} tone="green" />
          <KpiCard label="Đã từ chối" value={stats.rejected} tone="red" />
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  tone,
}: {
  readonly label: string;
  readonly value: number;
  readonly tone: "gray" | "yellow" | "green" | "red";
}) {
  const toneMap = {
    gray: "bg-gray-50 text-gray-800",
    yellow: "bg-yellow-50 text-yellow-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
  } as const;

  return (
    <div className={`rounded-xl p-4 ${toneMap[tone]}`}>
      <p className="text-sm opacity-80">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
