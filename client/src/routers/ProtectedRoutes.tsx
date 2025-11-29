import { Navigate, Outlet, Route } from "react-router-dom";
import { MainLayout } from "@/layouts";

import { HomePage, JobDetail } from "@/pages";
import { useUserStore } from "@/stores/useUserStore";

// Logic bảo vệ
function ProtectedRouteGuard() {
  const token = useUserStore((s) => s.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

// Danh sách route cần login
export function ProtectedRoutes() {
  return (
    <Route element={<ProtectedRouteGuard />}>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs/:id" element={<JobDetail />} />

        {/* Thêm route bảo vệ khác ở đây */}
      </Route>
    </Route>
  );
}
