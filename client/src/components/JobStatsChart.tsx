// src/components/JobStatsChart.tsx
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";

import { useMyJobs } from "@/hooks";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
);

export function JobStatsDashboard() {
  const { data } = useMyJobs(1, 999);

  const jobs = useMemo(() => data?.jobs ?? [], [data]);

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  // ===============================
  // Danh sách năm có dữ liệu
  // ===============================
  const years = useMemo(
    () =>
      Array.from(
        new Set(jobs.map((j) => new Date(j.createdAt).getFullYear())),
      ).sort((a, b) => b - a),
    [jobs],
  );

  // Sync year nếu năm hiện tại không có data
  useEffect(() => {
    if (years.length === 0) {
      return;
    }
    if (!years.includes(year)) {
      setYear(years[0]);
    }
  }, [years, year]);

  // ===============================
  // Job theo năm được chọn
  // ===============================
  const jobsOfYear = useMemo(
    () => jobs.filter((j) => new Date(j.createdAt).getFullYear() === year),
    [jobs, year],
  );

  // ===============================
  // PIE CHART – trạng thái duyệt (THEO NĂM)
  // ===============================
  const approved = jobsOfYear.filter(
    (j) => j.approval?.status === "approved",
  ).length;

  const pending = jobsOfYear.filter(
    (j) => j.approval?.status === "pending",
  ).length;

  const rejected = jobsOfYear.filter(
    (j) => j.approval?.status === "rejected",
  ).length;

  const pieData = {
    labels: ["Đã được duyệt", "Đang chờ duyệt", "Bị từ chối"],
    datasets: [
      {
        data: [approved, pending, rejected],
        backgroundColor: ["#22C55E", "#FACC15", "#EF4444"],
      },
    ],
  };

  // ===============================
  // BAR CHART – job theo tháng (THEO NĂM)
  // ===============================
  const monthlyCounts = new Array(12).fill(0);

  for (const job of jobsOfYear) {
    const month = new Date(job.createdAt).getMonth();
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
        label: `Số bài đăng năm ${year}`,
        data: monthlyCounts,
        backgroundColor: "#3B82F6",
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="space-y-4">
      {/* ===== HEADER + YEAR SELECT ===== */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          Thống kê tin tuyển dụng năm {year}
        </h2>

        <div className="relative">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="
              appearance-none
              rounded-lg border border-gray-300 bg-white
              px-4 py-2 pr-10 text-sm font-medium
              text-gray-700 shadow-sm
              hover:border-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          >
            {years.map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* ===== DASHBOARD ===== */}
      <div
        className="
          grid grid-cols-1 md:grid-cols-2 gap-10
          bg-white rounded-2xl p-8
          shadow-lg border border-gray-100
        "
      >
        {/* PIE */}
        <div className="h-[300px] flex items-center justify-center">
          <Pie data={pieData} redraw />
        </div>

        {/* BAR */}
        <div className="h-[300px]">
          <Bar
            data={barData}
            redraw
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { stepSize: 1 },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
