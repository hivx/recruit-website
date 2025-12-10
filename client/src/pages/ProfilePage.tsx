// src/pages/ProfilePage.tsx
import {
  FavoriteJobsCard,
  MyApplicationsCard,
  UserInfoCard,
  MySkillsCard,
} from "@/components/profile";

export function ProfilePage() {
  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br from-gray-50 via-white to-blue-50 
        bg-[length:100%_100%]
      "
    >
      <div className="mx-auto max-w-6xl space-y-8 py-10">
        <UserInfoCard />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FavoriteJobsCard />
          <MyApplicationsCard />
        </div>

        {/* SKILL LIST — CARD TO RENDER UNDER TWO CARDS */}
        <MySkillsCard />
      </div>
    </div>
  );
}
