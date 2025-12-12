// src/pages/ProfilePage.tsx
import {
  FavoriteJobsCard,
  MyApplicationsCard,
  UserInfoCard,
  MySkillsCard,
  RecruiterPreferencesCard,
} from "@/components/profile";
import { useUserStore } from "@/stores";

export function ProfilePage() {
  const userRole = useUserStore((s) => s.user?.role);

  const isApplicant = userRole === "applicant" || userRole === "admin";
  const isRecruiter = userRole === "recruiter" || userRole === "admin";

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br from-gray-50 via-white to-blue-50 
        bg-[length:100%_100%]
      "
    >
      <div className="mx-auto max-w-6xl space-y-8 py-10">
        {/* ================= USER INFO ================= */}
        <UserInfoCard />

        {/* ================= COMMON CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FavoriteJobsCard />
          <MyApplicationsCard />
        </div>

        {/* ================= ROLE BASED SECTION ================= */}
        {isApplicant && <MySkillsCard />}

        {isRecruiter && <RecruiterPreferencesCard />}
      </div>
    </div>
  );
}
