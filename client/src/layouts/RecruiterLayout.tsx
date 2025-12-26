// src/layouts/RecruiterLayout.tsx
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components";
import { Footer } from "@/components/layout";
import { RecruiterSidebar } from "@/components/recruiter";

export function RecruiterLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar giống MainLayout */}
      <Navbar />

      {/* Khu vực chứa sidebar + nội dung recruiter */}
      <div className="flex gap-6 px-6 py-8">
        <RecruiterSidebar />

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}
