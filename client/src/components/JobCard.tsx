// src/components/JobCard.tsx

import { Link } from "react-router-dom";
import type { Job } from "@/types/job";

type JobCardProps = Readonly<{
  job: Job;
}>;

export function JobCard({ job }: JobCardProps) {
  // Salary range
  let salaryText: string | null = null;

  if (job.salaryMin && job.salaryMax) {
    salaryText = `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} VND`;
  } else if (job.salaryMin) {
    salaryText = `${job.salaryMin.toLocaleString()} VND`;
  } else if (job.salaryMax) {
    salaryText = `${job.salaryMax.toLocaleString()} VND`;
  }

  // Date posted
  const postedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString("vi-VN")
    : "N/A";

  return (
    <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition">
      {/* Title */}
      {job.id ? (
        <Link to={`/jobs/${job.id}`}>
          <h2 className="text-xl font-semibold text-blue-600 hover:underline">
            {job.title}
          </h2>
        </Link>
      ) : (
        <h2 className="text-xl font-semibold text-gray-600">{job.title}</h2>
      )}

      {/* Company */}
      <p className="text-gray-700">
        {job.company?.legalName ?? "Không rõ công ty"}
      </p>

      {/* Created date */}
      <p className="text-sm text-gray-500">Đăng ngày {postedDate}</p>

      {/* Location + Salary */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
        {job.location && <span>{job.location}</span>}
        {salaryText && <span>{salaryText}</span>}
      </div>

      {/* Tags */}
      {Array.isArray(job.tags) && job.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {job.tags.map((jt, index) => (
            <span
              key={`${job.id}-${jt.tagId}-${index}`}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
            >
              {jt.tag?.name ?? "Tag không tên"}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
