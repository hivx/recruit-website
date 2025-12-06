// src/layouts/MainLayout.tsx
import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components";

type MainLayoutProps = {
  readonly children?: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Nội dung trang */}
      <div className="flex-1 w-full">
        <Outlet />
        {children}
      </div>
    </div>
  );
}
