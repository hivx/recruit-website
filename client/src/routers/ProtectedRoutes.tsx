// src/routers/ProtectedRoutes.tsx
import { Navigate, Outlet, Route } from "react-router-dom";
import { MainLayout, TransitionLayout, RecruiterLayout } from "@/layouts";
import {
  RecruiterHomePage,
  RecruiterCompanyPage,
  RecruiterApplicantsPage,
} from "@/pages/recruiter";
import { useUserStore } from "@/stores";

// Logic bảo vệ: cần có token (đăng nhập)
function ProtectedRouteGuard() {
  const token = useUserStore((s) => s.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

// Logic bảo vệ: chỉ cho recruiter & admin
export function ProtectedRecruiterRoute() {
  const user = useUserStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "applicant") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function ProtectedRoutes() {
  return (
    <Route element={<TransitionLayout />}>
      {/* Cần token */}
      <Route element={<ProtectedRouteGuard />}>
        {/* ROUTE CHUNG SAU KHI LOGIN */}
        <Route element={<MainLayout />}>
          {/* Các trang Applicant + Admin + Recruiter dùng MainLayout */}
        </Route>

        {/* ROUTE DÀNH RIÊNG CHO RECRUITER */}
        <Route element={<ProtectedRecruiterRoute />}>
          <Route element={<RecruiterLayout />}>
            <Route path="/recruiter" element={<RecruiterHomePage />} />
            <Route path="/recruiter/jobs" element={<RecruiterHomePage />} />
            {/* Các trang khác của recruiter */}
            <Route
              path="/recruiter/company"
              element={<RecruiterCompanyPage />}
            />
            <Route
              path="/recruiter/applicants"
              element={<RecruiterApplicantsPage />}
            />
            {/* <Route path="/recruiter/applicants" element={<ApplicantsPage />} /> */}
          </Route>
        </Route>
      </Route>
    </Route>
  );
}
