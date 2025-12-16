import { JobStatsDashboard } from "@/components";
import { AdminUserList, AdminUserRoleStatsChart } from "@/components/admin";
import { useUserStore } from "@/stores";

export function AdminHomePage() {
  const user = useUserStore((s) => s.user);

  return (
    <div
      className="
        min-h-screen w-full
        bg-gradient-to-br from-blue-50 via-white to-blue-100
        pb-20
      "
    >
      {/* ===================== HEADER ===================== */}
      <div className="shadow-lg bg-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Xin chào quản trị viên {user?.name || "quản trị viên"}
          </h1>
          <p className="text-gray-600 mt-2">
            Tổng quan, báo cáo và quản lý tất cả thông tin của hệ thống!
          </p>
        </div>
      </div>

      {/* ===================== MAIN CONTENT ===================== */}
      <div className="max-w-7xl mx-auto px-4 mt-16 space-y-20">
        {/* -------- JOB APPROVAL STATISTICS -------- */}
        <section>
          <h2
            className="
              text-2xl font-bold mb-6 text-gray-800
              flex items-center gap-2
            "
          >
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
            Thống kê công việc{" "}
          </h2>

          <JobStatsDashboard />
        </section>

        {/* -------- COMPANY APPROVAL STATISTICS -------- */}
        {/* 
        <section>
          <h2
            className="
              text-2xl font-bold mb-6 text-gray-800
              flex items-center gap-2
            "
          >
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
            Thống kê công ty
          </h2>

          <AdminCompanyApprovalStatsChart />
        </section>
        */}

        {/* -------- USER STATISTICS -------- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <AdminUserList />
          <AdminUserRoleStatsChart />
        </section>
      </div>
    </div>
  );
}
