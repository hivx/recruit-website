// src/components/JobCard.tsx
import { Link } from "react-router-dom";
import type { Job } from "@/types";

type JobCardProps = Readonly<{
  job: Job;
}>;

export function JobCard({ job }: JobCardProps) {
  // Hiển thị salary range
  let salaryText: string | null = null;
  if (job.salaryMin && job.salaryMax) {
    salaryText = `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} VND`;
  } else if (job.salaryMin) {
    salaryText = `${job.salaryMin.toLocaleString()} VND`;
  } else if (job.salaryMax) {
    salaryText = `${job.salaryMax.toLocaleString()} VND`;
  }

  // Extracted posted date logic to avoid nested ternary
  let postedDate: string;
  if (job.createdAtFormatted) {
    postedDate = job.createdAtFormatted;
  } else if (job.createdAt) {
    postedDate = new Date(job.createdAt).toLocaleDateString();
  } else {
    postedDate = "N/A";
  }

  return (
    <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition">
      {/* Tiêu đề + link */}
      <Link to={`/jobs/${job.id}`}>
        <h2 className="text-xl font-semibold text-blue-600 hover:underline">
          {job.title}
        </h2>
      </Link>

      {/* Công ty */}
      <p className="text-gray-700">{job.company}</p>

      {/* Người tạo + ngày */}
      <p className="text-sm text-gray-500">
        Được đăng bởi {job.createdByName} • {postedDate}
      </p>

      {/* Location + Salary */}
      <div className="flex gap-4 text-sm text-gray-600 mt-2">
        {job.location && <span>📍 {job.location}</span>}
        {salaryText && <span>💰 {salaryText}</span>}
      </div>

      {/* Tags */}
      {job.tags?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {job.tags.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
