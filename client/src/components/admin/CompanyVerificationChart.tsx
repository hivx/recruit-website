// src/components/admin/CompanyVerificationChart.tsx
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import type { TooltipItem } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

import { useListCompanies } from "@/hooks";
import type { Company } from "@/types";

ChartJS.register(ArcElement, Tooltip, Legend);

function buildStats(companies: Company[]) {
  let submitted = 0;
  let verified = 0;
  let rejected = 0;

  for (const c of companies) {
    const status = c.verification?.status;

    if (status === "verified") {
      verified++;
    } else if (status === "rejected") {
      rejected++;
    } else {
      // submitted hoặc null
      submitted++;
    }
  }

  return {
    submitted,
    verified,
    rejected,
  };
}

export function CompanyVerificationChart() {
  const { data, isLoading, error } = useListCompanies({
    page: 1,
    limit: 1000,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <p className="text-gray-500">Đang tải dữ liệu…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <p className="text-red-500">Không tải được dữ liệu công ty</p>
      </div>
    );
  }

  const stats = buildStats(data.companies);

  const chartData = {
    labels: ["Đang chờ", "Đã duyệt", "Từ chối"],
    datasets: [
      {
        data: [stats.submitted, stats.verified, stats.rejected],
        backgroundColor: [
          "#facc15", // vàng
          "#22c55e", // xanh
          "#ef4444", // đỏ
        ],
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
          label: (ctx: TooltipItem<"doughnut">) => {
            const label = ctx.label ?? "";
            const value = ctx.parsed;

            const data = ctx.dataset.data;
            const total = data.reduce((sum, v) => sum + v, 0);

            const percent =
              total > 0 ? ((value / total) * 100).toFixed(1) : "0";

            return `${label}: ${value} (${percent}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="text-lg font-semibold mb-4">
        Biểu đồ trạng thái xét duyệt công ty
      </h3>

      <div className="relative h-64">
        <Doughnut data={chartData} options={options} />
      </div>

      {/* Summary text */}
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <span className="text-yellow-600">
          Đang chờ: <b>{stats.submitted}</b>
        </span>
        <span className="text-green-600">
          Đã duyệt: <b>{stats.verified}</b>
        </span>
        <span className="text-red-600">
          Từ chối: <b>{stats.rejected}</b>
        </span>
      </div>
    </div>
  );
}
