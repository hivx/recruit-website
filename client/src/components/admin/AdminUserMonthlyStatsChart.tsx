// src/components/admin/AdminUserMonthlyStatsChart.tsx
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

import { useAdminUsers } from "@/hooks";

export function AdminUserMonthlyStatsChart() {
  // Lấy nhiều user để thống kê (admin dashboard)
  const { data } = useAdminUsers({ page: 1, limit: 999 });
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const users = data?.users ?? [];

  // ===============================
  // Thống kê số user theo tháng
  // ===============================
  const monthlyCounts = new Array(12).fill(0);
  const years = Array.from(
    new Set(
      users
        .map((u) => (u.createdAt ? new Date(u.createdAt).getFullYear() : null))
        .filter((y): y is number => typeof y === "number"),
    ),
  ).sort((a, b) => b - a);

  for (const user of users) {
    if (!user.createdAt) {
      continue;
    }

    const date = new Date(user.createdAt);
    if (Number.isNaN(date.getTime())) {
      continue;
    }

    if (date.getFullYear() !== year) {
      continue;
    }

    const month = date.getMonth();
    monthlyCounts[month] += 1;
  }
  useEffect(() => {
    if (years.length === 0) {
      return;
    }

    // Nếu year hiện tại không có trong data → set về năm mới nhất có dữ liệu
    if (!years.includes(year)) {
      setYear(years[0]); // years đã sort DESC
    }
  }, [years, year]);

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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Thống kê người dùng được tạo năm {year}
        </h3>

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="
      rounded-lg border border-gray-300
      px-3 py-1.5 text-sm
      focus:outline-none focus:ring-2 focus:ring-blue-400
    "
        >
          {years.map((y) => (
            <option key={y} value={y}>
              Năm {y}
            </option>
          ))}
        </select>
      </div>

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
