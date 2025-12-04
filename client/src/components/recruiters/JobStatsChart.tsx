import { Pie } from "react-chartjs-2";
import { useMyJobs } from "@/hooks";

export function JobStatsChart() {
  const { data } = useMyJobs(1, 999); // lấy tất cả job

  const jobs = data?.jobs ?? [];

  const approved = jobs.filter((j) => j.approval?.status === "approved").length;
  const pending = jobs.filter((j) => j.approval?.status === "pending").length;
  const rejected = jobs.filter((j) => j.approval?.status === "rejected").length;

  const chartData = {
    labels: ["Đã duyệt", "Chờ duyệt", "Từ chối"],
    datasets: [
      {
        data: [approved, pending, rejected],
        backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
      },
    ],
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
      <Pie data={chartData} />
    </div>
  );
}
