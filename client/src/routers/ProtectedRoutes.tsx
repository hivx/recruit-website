// src/routers/ProtectedRoutes.tsx
import { Navigate, Outlet, Route } from "react-router-dom";
import { MainLayout, RecruiterLayout, AdminLayout } from "@/layouts";
import { ProfilePage, ChangePasswordPage } from "@/pages";
import {
  AdminHomePage,
  AdminJobsPage,
  AdminCompaniesPage,
} from "@/pages/admin";
import {
  RecruiterHomePage,
  RecruiterCompanyPage,
  RecruiterApplicantsPage,
  CreateJobPage,
  EditJobPage,
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

// Logic bảo vệ: chỉ cho admin
export function ProtectedAdminRoute() {
  const user = useUserStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function ProtectedRoutes() {
  return (
    <Route>
      {/* Cần token */}
      <Route element={<ProtectedRouteGuard />}>
        {/* ROUTE CHUNG SAU KHI LOGIN */}
        <Route element={<MainLayout />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>

        {/* ROUTE DÀNH RIÊNG CHO RECRUITER */}
        <Route element={<ProtectedRecruiterRoute />}>
          <Route path="/recruiter" element={<RecruiterLayout />}>
            <Route index element={<RecruiterHomePage />} />
            <Route path="jobs" element={<RecruiterHomePage />} />
            <Route path="company" element={<RecruiterCompanyPage />} />
            <Route path="applicants" element={<RecruiterApplicantsPage />} />
            <Route path="jobs/create" element={<CreateJobPage />} />
            <Route path="jobs/:id/edit" element={<EditJobPage />} />
          </Route>
        </Route>

        {/* ROUTE DÀNH RIÊNG CHO ADMIN */}
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHomePage />} />
            <Route path="dashboard" element={<AdminHomePage />} />
            <Route path="jobs" element={<AdminJobsPage />} />
            <Route path="companies" element={<AdminCompaniesPage />} />
          </Route>
        </Route>
      </Route>
    </Route>
  );
}
