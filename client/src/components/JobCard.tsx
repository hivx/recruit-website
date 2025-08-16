// src/components/JobCard.tsx
import { Link } from "react-router-dom";
import type { Job } from "@/types";

type JobCardProps = Readonly<{
  job: Job;
}>;

export function JobCard({ job }: JobCardProps) {
  return (
    <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition">
      {/* Tiêu đề + link */}
      <Link to={`/jobs/${job._id}`}>
        <h2 className="text-xl font-semibold text-blue-600 hover:underline">
          {job.title}
        </h2>
      </Link>

      {/* Công ty */}
      <p className="text-gray-700">{job.company}</p>

      {/* Người tạo + ngày */}
      <p className="text-sm text-gray-500">
        Posted by {job.createdByName} • {new Date(job.createdAt).toLocaleDateString()}
      </p>

      {/* Location + Salary */}
      <div className="flex gap-4 text-sm text-gray-600 mt-2">
        {job.location && <span>📍 {job.location}</span>}
        {job.salary && <span>💰 {job.salary}</span>}
      </div>

      {/* Tags */}
      {job.tags?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <span
              key={tag}
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
