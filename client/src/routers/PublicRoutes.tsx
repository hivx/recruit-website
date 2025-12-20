// src/routers/PublicRoutes.tsx
import { Route } from "react-router-dom";
import { MainLayout } from "@/layouts";
import { HomePage, JobDetail } from "@/pages";

export function PublicRoutes() {
  return (
    <Route>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="jobs/:id" element={<JobDetail />} />
      </Route>
    </Route>
  );
}
