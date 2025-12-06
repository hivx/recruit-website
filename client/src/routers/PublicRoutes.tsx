// src/routers/PublicRoutes.tsx
import { Route } from "react-router-dom";
import { MainLayout, TransitionLayout } from "@/layouts";
import { HomePage, JobDetail } from "@/pages";

export function PublicRoutes() {
  return (
    <Route element={<TransitionLayout />}>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
      </Route>
    </Route>
  );
}
