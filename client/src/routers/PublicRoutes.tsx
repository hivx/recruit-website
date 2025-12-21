// src/routers/PublicRoutes.tsx
import { Route } from "react-router-dom";
import { MainLayout } from "@/layouts";
import { HomePage, JobDetail } from "@/pages";
import { TestJobService } from "@/test";

export function PublicRoutes() {
  return (
    <Route>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="jobs/:id" element={<JobDetail />} />
        <Route path="test" element={<TestJobService />} />
      </Route>
    </Route>
  );
}
