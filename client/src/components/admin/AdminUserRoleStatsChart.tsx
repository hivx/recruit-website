// src/components/admin/AdminUserRoleStatsChart.tsx
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

import { useAdminUsers } from "@/hooks";

export function AdminUserRoleStatsChart() {
  // Lấy toàn bộ user để thống kê
  const { data } = useAdminUsers({ page: 1, limit: 999 });

  const users = data?.users ?? [];

  const adminCount = users.filter((u) => u.role === "admin").length;
  const recruiterCount = users.filter((u) => u.role === "recruiter").length;
  const applicantCount = users.filter((u) => u.role === "applicant").length;

  const pieData = {
    labels: ["Admin", "Recruiter", "Applicant"],
    datasets: [
      {
        data: [adminCount, recruiterCount, applicantCount],
        backgroundColor: ["#6366F1", "#22C55E", "#3B82F6"],
        borderWidth: 0,
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
        Phân chia người dùng theo vai trò
      </h3>

      <div className="h-[260px] flex items-center justify-center">
        <Pie
          data={pieData}
          redraw
          options={{
            plugins: {
              legend: {
                position: "bottom",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
