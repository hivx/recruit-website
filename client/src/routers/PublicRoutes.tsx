// src/routers/PublicRoutes.tsx
import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import { MainLayout } from "@/layouts";
import HomePage from "@/pages/HomePage";

const JobDetailPage = lazy(() => import("@/pages/JobDetailPage"));
const TestJobService = lazy(() => import("@/test/Test"));

export function PublicRoutes() {
  return (
    <Route
      element={
        <Suspense fallback={<div>Đang tải...</div>}>
          <MainLayout />
        </Suspense>
      }
    >
      <Route index element={<HomePage />} />
      <Route path="jobs/:id" element={<JobDetailPage />} />
      <Route path="test" element={<TestJobService />} />
    </Route>
  );
}
