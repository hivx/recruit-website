// src/components/admin/AdminUserMonthlyStatsChart.tsx
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

import { useAdminUsers } from "@/hooks";

export function AdminUserMonthlyStatsChart() {
  // Lấy nhiều user để thống kê (admin dashboard)
  const { data } = useAdminUsers({ page: 1, limit: 999 });

  const users = data?.users ?? [];

  // ===============================
  // Thống kê số user theo tháng
  // ===============================
  const monthlyCounts = new Array(12).fill(0);

  for (const user of users) {
    if (!user.createdAt) {
      continue;
    }

    const date = new Date(user.createdAt);
    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const month = date.getMonth(); // 0–11
    monthlyCounts[month] += 1;
  }

  const barData = {
    labels: [
      "Th1",
      "Th2",
      "Th3",
      "Th4",
      "Th5",
      "Th6",
      "Th7",
      "Th8",
      "Th9",
      "Th10",
      "Th11",
      "Th12",
    ],
    datasets: [
      {
        label: "User mới",
        data: monthlyCounts,
        backgroundColor: "#3B82F6",
        borderRadius: 8,
      },
    ],
  };

  return (
    <div
      className="
        bg-white rounded-2xl p-6 shadow-lg border border-gray-100
        flex flex-col
      "
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Thống kê người dùng được tạo theo tháng
      </h3>

      <div className="h-[260px]">
        <Bar
          data={barData}
          redraw
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const value = ctx.parsed.y;
                    return `${value} người dùng`;
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
