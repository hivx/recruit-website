import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
);

import { Pie, Bar } from "react-chartjs-2";
import { useMyJobs } from "@/hooks";

export function JobStatsDashboard() {
  const { data } = useMyJobs(1, 999);

  const jobs = data?.jobs ?? [];

  // ==========================================
  // 1) PIE CHART – trạng thái phê duyệt
  // ==========================================
  const approved = jobs.filter((j) => j.approval?.status === "approved").length;
  const pending = jobs.filter((j) => j.approval?.status === "pending").length;
  const rejected = jobs.filter((j) => j.approval?.status === "rejected").length;

  const pieData = {
    labels: ["Đã duyệt", "Chờ duyệt", "Từ chối"],
    datasets: [
      {
        data: [approved, pending, rejected],
        backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
      },
    ],
  };

  // ==========================================
  // 2) BAR CHART – số job theo tháng trong năm
  // ==========================================
  const monthlyCounts = new Array(12).fill(0);

  for (const job of jobs) {
    const date = new Date(job.createdAt);
    const month = date.getMonth(); // 0 = Jan
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
        label: "Số bài đăng",
        data: monthlyCounts,
        backgroundColor: "#3B82F6",
      },
    ],
  };

  return (
    <div
      className="
        grid grid-cols-1 md:grid-cols-2 gap-10 
        bg-white rounded-2xl p-8 shadow-lg border border-gray-100
      "
    >
      {/* LEFT: PIE CHART */}
      <div className="w-full h-[300px] flex items-center justify-center">
        <Pie data={pieData} redraw />
      </div>

      {/* RIGHT: BAR CHART */}
      <div className="w-full h-[300px]">
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
  );
}
