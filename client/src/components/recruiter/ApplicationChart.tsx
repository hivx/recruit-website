// src/components/recruiter/ApplicationChart.tsx
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import type { Application } from "@/types";

ChartJS.register(ArcElement, Tooltip, Legend);

export function ApplicationStatusChart({
  applications,
}: {
  readonly applications: Application[];
}) {
  const pending = applications.filter((a) => a.status === "pending").length;
  const accepted = applications.filter((a) => a.status === "accepted").length;
  const rejected = applications.filter((a) => a.status === "rejected").length;

  const data = {
    labels: ["Chờ duyệt", "Đã chấp nhận", "Từ chối"],
    datasets: [
      {
        data: [pending, accepted, rejected],
        backgroundColor: ["#FBBF24", "#34D399", "#F87171"],
      },
    ],
  };

  return (
    <div className="w-full h-[300px] flex items-center justify-center">
      <Pie data={data} redraw />
    </div>
  );
}

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export function ApplicantsMonthlyChart({
  applications,
}: {
  readonly applications: Application[];
}) {
  const monthly = new Array(12).fill(0);

  applications.forEach((app) => {
    const date = new Date(app.createdAt);
    const month = date.getMonth(); // 0–11
    monthly[month] += 1;
  });

  const data = {
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
        label: "Số ứng viên",
        data: monthly,
        backgroundColor: "#3B82F6",
      },
    ],
  };

  return (
    <div className="w-full h-[300px]">
      <Bar
        data={data}
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
  );
}
