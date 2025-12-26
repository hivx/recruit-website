// src/routers/AuthRoutes.tsx
import { Navigate, Outlet, Route } from "react-router-dom";
import { LoginPage, ForgotPasswordPage, RegisterPage } from "@/pages";
import { useUserStore } from "@/stores";

// Logic bảo vệ
function PublicRouteGuard() {
  const token = useUserStore((s) => s.token);
  if (token) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

// Danh sách route public
export function AuthRoutes() {
  return (
    <Route element={<PublicRouteGuard />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* <Route path="/register" element={<RegisterPage />} /> */}
    </Route>
  );
}
