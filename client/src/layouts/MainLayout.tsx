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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
        <Outlet />
      </main>
    </div>
  );
}
