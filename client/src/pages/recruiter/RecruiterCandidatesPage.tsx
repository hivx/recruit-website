// src/pages/recruiter/RecruiterCandidatesPage.tsx
import { RecommendedCandidateList } from "@/components/recruiter";
import { useUserStore } from "@/stores";

export function RecruiterCandidatesPage() {
  const user = useUserStore((s) => s.user);

  // recruiterId lấy từ user login
  if (!user?.id) {
    return null;
  }

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
            Ứng viên tiềm năng
          </h1>
          <p className="text-gray-600 mt-2 max-w-3xl">
            Danh sách ứng viên được hệ thống đề xuất dựa trên độ phù hợp với các
            bài tuyển dụng của bạn.
          </p>
        </div>
      </div>

      {/* ===================== MAIN CONTENT ===================== */}
      <div className="max-w-7xl mx-auto px-4 mt-16 space-y-16">
        {/* -------- RECOMMENDED CANDIDATES -------- */}
        <section>
          <h2
            className="
              text-2xl font-bold mb-6 text-gray-800
              flex items-center gap-2
            "
          >
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
            Ứng viên phù hợp nhất{" "}
          </h2>

          <RecommendedCandidateList recruiterId={Number(user.id)} />
        </section>
      </div>
    </div>
  );
}
