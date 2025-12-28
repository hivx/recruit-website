//src/routers/AuthRoutes.tsx
import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route } from "react-router-dom";
import { useUserStore } from "@/stores";

// dynamic imports
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));

// Guard
function PublicRouteGuard() {
  const token = useUserStore((s) => s.token);
  if (token) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

// Routes
export function AuthRoutes() {
  return (
    <Route
      element={
        <Suspense fallback={<div>Đang tải...</div>}>
          <PublicRouteGuard />
        </Suspense>
      }
    >
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Route>
  );
}
