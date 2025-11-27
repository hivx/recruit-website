import { Navigate, Outlet, Route } from "react-router-dom";
import LoginPage from "@/pages/Login";
import { useUserStore } from "@/stores/useUserStore";

// Logic bảo vệ
function PublicRouteGuard() {
  const token = useUserStore((s) => s.token);
  if (token) {
    return <Navigate to="/jobs" replace />;
  }
  return <Outlet />;
}

// Danh sách route public
export function PublicRoutes() {
  return (
    <Route element={<PublicRouteGuard />}>
      <Route path="/login" element={<LoginPage />} />
      {/* <Route path="/register" element={<RegisterPage />} /> */}
    </Route>
  );
}
