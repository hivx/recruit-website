// src/routers/ProtectedRoutes.tsx
import { Navigate, Outlet, Route } from "react-router-dom";
import {
  MainLayout,
  TransitionLayout,
  RecruiterLayout,
  AdminLayout,
} from "@/layouts";
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
    <Route element={<TransitionLayout />}>
      {/* Cần token */}
      <Route element={<ProtectedRouteGuard />}>
        {/* ROUTE CHUNG SAU KHI LOGIN */}
        <Route element={<MainLayout />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>

        {/* ROUTE DÀNH RIÊNG CHO RECRUITER */}
        <Route element={<ProtectedRecruiterRoute />}>
          <Route element={<RecruiterLayout />}>
            <Route path="/recruiter" element={<RecruiterHomePage />} />
            <Route path="/recruiter/jobs" element={<RecruiterHomePage />} />
            <Route
              path="/recruiter/company"
              element={<RecruiterCompanyPage />}
            />
            <Route
              path="/recruiter/applicants"
              element={<RecruiterApplicantsPage />}
            />
            <Route path="/recruiter/jobs/create" element={<CreateJobPage />} />
            <Route path="/recruiter/jobs/:id/edit" element={<EditJobPage />} />
          </Route>
        </Route>

        {/* ROUTE DÀNH RIÊNG CHO ADMIN */}
        <Route element={<ProtectedAdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminHomePage />} />
            <Route path="/admin/dashboard" element={<AdminHomePage />} />
            <Route path="/admin/jobs" element={<AdminJobsPage />} />
            <Route path="/admin/companies" element={<AdminCompaniesPage />} />
          </Route>
        </Route>
      </Route>
    </Route>
  );
}
