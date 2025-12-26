// src/layouts/AdminLayout.tsx
import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components";
import { AdminSidebar } from "@/components/admin";
import { Footer } from "@/components/layout";

type AdminLayoutProps = {
  readonly children?: ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar dùng chung toàn hệ thống */}
      <Navbar />
      {/* Khu vực sidebar + nội dung admin */}
      <div className="flex gap-6 px-6 py-8">
        <AdminSidebar />

        <div className="flex-1 min-w-0">
          <Outlet />
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
