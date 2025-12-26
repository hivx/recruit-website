// src/pages/admin/AdminCompaniesPage.tsx
import { AdminCompanyList } from "@/components/admin";
import { useUserStore } from "@/stores";

export default function AdminCompaniesPage() {
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
          <h1 className="text-3xl font-bold text-gray-800">Quản lý công ty </h1>
          <p className="text-gray-600 mt-2">
            Xin chào {user?.name || "quản trị viên"}, theo dõi và phê duyệt hồ
            sơ công ty trong hệ thống.
          </p>
        </div>
      </div>

      {/* ===================== MAIN CONTENT ===================== */}
      <div className="max-w-7xl mx-auto px-4 mt-16 space-y-20">
        {/* -------- COMPANY APPROVAL LIST -------- */}
        <section>
          <h2
            className="
              text-2xl font-bold mb-6 text-gray-800
              flex items-center gap-2
            "
          >
            <span className="w-2 h-6 bg-green-500 rounded-full"></span>
            Danh sách tất cả công ty{" "}
          </h2>

          <AdminCompanyList />
        </section>
      </div>
    </div>
  );
}
