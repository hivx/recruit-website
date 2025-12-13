// src/pages/ProfilePage.tsx
import { ExternalLink } from "lucide-react";
import { useEffect } from "react";
import {
  FavoriteJobsCard,
  MyApplicationsCard,
  UserInfoCard,
  MySkillsCard,
  RecruiterPreferencesCard,
} from "@/components/profile";
import { useAllSkills } from "@/hooks";
import { useUserStore, useSkillStore } from "@/stores";

export function ProfilePage() {
  const userRole = useUserStore((s) => s.user?.role);
  const setAllSkills = useSkillStore((s) => s.setAllSkills);

  const { data, isSuccess } = useAllSkills();

  useEffect(() => {
    if (isSuccess && data) {
      setAllSkills(data);
    }
  }, [isSuccess, data, setAllSkills]);

  const isApplicant = userRole === "applicant" || userRole === "admin";
  const isRecruiter = userRole === "recruiter" || userRole === "admin";

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br from-gray-50 via-white to-blue-50
      "
    >
      <div className="mx-auto max-w-6xl py-10 space-y-8">
        {/* ================= USER INFO ================= */}
        <UserInfoCard />

        {/* ================= APPLICANT LAYOUT ================= */}
        {isApplicant && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FavoriteJobsCard />
              <MyApplicationsCard />
            </div>

            <MySkillsCard />
          </>
        )}

        {/* ================= RECRUITER LAYOUT ================= */}
        {isRecruiter && (
          <div className="space-y-8">
            {/* ROW 1 – FULL WIDTH */}
            <RecruiterPreferencesCard />

            {/* ROW 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* LEFT – FAVORITE JOBS */}
              <div className="md:col-span-2">
                <FavoriteJobsCard />
              </div>

              {/* RIGHT – CTA */}
              <div
                className="
                  bg-white rounded-2xl
                  border border-blue-100
                  p-6
                  flex flex-col justify-between
                  shadow-sm
                  hover:shadow-md
                  transition
                "
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Trang tuyển dụng
                  </h3>
                  <p className="text-sm text-gray-600">
                    Truy cập trang tuyển dụng để quản lý tin đăng, xem ứng viên
                    và theo dõi hiệu quả tuyển dụng.
                  </p>
                </div>

                <a
                  href="/recruiter/jobs"
                  className="
                    mt-6 inline-flex items-center justify-center gap-2
                    px-4 py-2 rounded-xl
                    bg-blue-600 text-white font-semibold
                    hover:bg-blue-700
                    transition
                  "
                >
                  Truy cập ngay
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
