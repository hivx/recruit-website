// src/routers/index.tsx
import { Routes, Route } from "react-router-dom";
import { JobList, JobDetail } from "@/pages";
import LoginPage from "@/pages/Login";
import { TestJobService } from "@/test";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/test" element={<TestJobService />} />
      <Route path="/jobs" element={<JobList />} />
      <Route path="/jobs/:id" element={<JobDetail />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
