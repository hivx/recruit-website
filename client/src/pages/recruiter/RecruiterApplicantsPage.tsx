import { useState } from "react";
import { ApplicantDetailModal } from "@/components/recruiter";
import { ApplicantList } from "@/components/recruiter/ApplicantList";
import { useMyJobs } from "@/hooks";
import type { Application, Job } from "@/types";

/**
 * Trang quản lý ứng viên của Recruiter
 */
export function RecruiterApplicantsPage() {
  /** PHÂN TRANG */
  const [page, setPage] = useState(1);

  /** BỘ LỌC */
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [jobId, setJobId] = useState<string | undefined>(undefined);

  /** MODAL CHI TIẾT ỨNG VIÊN */
  const [selected, setSelected] = useState<Application | null>(null);

  /** LẤY JOB CỦA NTD */
  const { data: jobData } = useMyJobs(1, 100);
  const jobList: Job[] = jobData?.jobs ?? [];

  return (
    <div
      className="
        max-w-7xl mx-auto p-6 space-y-12 animate-fade-in-up
        bg-gradient-to-b from-gray-50 to-gray-100/40 rounded-xl
      "
    >
      {/* ============================= HEADER ============================= */}
      <div className="flex items-center gap-3">
        <div
          className="
            w-12 h-12 rounded-xl bg-blue-100 text-blue-600
            flex items-center justify-center text-2xl font-bold
          "
        >
          👤
        </div>

        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Quản lý đơn ứng tuyển
        </h1>
      </div>

      {/* ============================= TOP CARDS ============================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Tổng quan job của bạn (mock)">
          <div className="h-40 flex items-center justify-center text-gray-400">
            Biểu đồ đang chờ dữ liệu API
          </div>
        </ChartCard>

        <ChartCard title="Số lượng ứng viên theo tháng (mock)">
          <div className="h-40 flex items-center justify-center text-gray-400">
            Biểu đồ đang chờ dữ liệu API
          </div>
        </ChartCard>
      </div>

      {/* ============================= FILTERS ============================= */}
      <div
        className="
          bg-white p-6 rounded-2xl shadow-lg border border-gray-100 
          backdrop-blur-sm flex flex-wrap items-center gap-8
          hover:shadow-xl transition-all
        "
      >
        {/* Filter JOB */}
        <div className="flex flex-col">
          <label htmlFor="job" className="text-sm font-semibold text-gray-700">
            Công việc
          </label>
          <select
            value={jobId ?? ""}
            onChange={(e) => {
              setJobId(e.target.value || undefined);
              setPage(1);
            }}
            className="
              mt-1 px-4 py-2 rounded-xl border border-gray-300 
              bg-gray-50 focus:bg-white transition
            "
          >
            <option value="">Tất cả</option>
            {jobList.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        {/* Filter STATUS */}
        <div className="flex flex-col">
          <label
            htmlFor="status"
            className="text-sm font-semibold text-gray-700"
          >
            Trạng thái
          </label>
          <select
            value={status ?? ""}
            onChange={(e) => {
              setStatus(e.target.value || undefined);
              setPage(1);
            }}
            className="
              mt-1 px-4 py-2 rounded-xl border border-gray-300 
              bg-gray-50 focus:bg-white transition
            "
          >
            <option value="">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="accepted">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      {/* ============================= APPLICANT LIST ============================= */}
      <ApplicantList
        page={page}
        limit={10}
        status={status}
        jobId={jobId}
        onPageChange={setPage}
        onSelectApplicant={(a) => setSelected(a)}
      />

      {/* ============================= DETAIL MODAL ============================= */}
      <ApplicantDetailModal
        app={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

/* ======================================================================
    SUB COMPONENT: CHART WRAPPER (đẹp + có hover)
====================================================================== */

function ChartCard({
  title,
  children,
}: {
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div
      className="
        bg-white rounded-2xl shadow-md border border-gray-100
        p-6 space-y-3 transition-all hover:shadow-xl hover:-translate-y-1
      "
    >
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      {children}
    </div>
  );
}
