// src/routers/ProtectedRoutes.tsx
import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route } from "react-router-dom";
import { MainLayout, RecruiterLayout, AdminLayout } from "@/layouts";
import { useUserStore } from "@/stores";

// ===== Common pages =====
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const ChangePasswordPage = lazy(() => import("@/pages/ChangePasswordPage"));

// ===== Admin pages =====
const AdminHomePage = lazy(() => import("@/pages/admin/AdminHomePage"));
const AdminJobsPage = lazy(() => import("@/pages/admin/AdminJobsPage"));
const AdminCompaniesPage = lazy(
  () => import("@/pages/admin/AdminCompaniesPage"),
);

// ===== Recruiter pages =====
const RecruiterHomePage = lazy(
  () => import("@/pages/recruiter/RecruiterHomePage"),
);
const RecruiterCompanyPage = lazy(
  () => import("@/pages/recruiter/CompanyPage"),
);
const RecruiterApplicantsPage = lazy(
  () => import("@/pages/recruiter/RecruiterApplicantsPage"),
);
const CreateJobPage = lazy(() => import("@/pages/recruiter/CreateJobPage"));
const EditJobPage = lazy(() => import("@/pages/recruiter/EditJobPage"));
const RecruiterCandidatesPage = lazy(
  () => import("@/pages/recruiter/RecruiterCandidatesPage"),
);

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
    <Route
      element={
        <Suspense fallback={<div>Đang tải...</div>}>
          <Outlet />
        </Suspense>
      }
    >
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
            <Route
              path="recommended/candidates"
              element={<RecruiterCandidatesPage />}
            />
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
