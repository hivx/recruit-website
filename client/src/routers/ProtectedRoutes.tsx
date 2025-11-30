import { Navigate, Outlet, Route } from "react-router-dom";
import { MainLayout, TransitionLayout } from "@/layouts";

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
    <Route element={<TransitionLayout />}>
      <Route element={<ProtectedRouteGuard />}>
        <Route element={<MainLayout />}>
          {/* Thêm route bảo vệ khác ở đây */}
        </Route>
      </Route>
    </Route>
  );
}
