// src/layouts/MainLayout.tsx
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components";
import { Footer } from "@/components/layout";

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Nội dung trang */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
