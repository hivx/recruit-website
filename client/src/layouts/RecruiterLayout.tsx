// src/layouts/RecruiterLayout.tsx
import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components";
import { RecruiterSidebar } from "@/components/recruiter";

type RecruiterLayoutProps = {
  readonly children?: ReactNode;
};

export function RecruiterLayout({ children }: RecruiterLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar giống MainLayout */}
      <Navbar />

      {/* Khu vực chứa sidebar + nội dung recruiter */}
      <div className="flex gap-6 px-6 py-8">
        <RecruiterSidebar />

        <div className="flex-1">
          <Outlet />
          {children}
        </div>
      </div>
    </div>
  );
}
