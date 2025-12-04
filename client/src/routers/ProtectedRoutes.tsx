import { Navigate, Outlet, Route } from "react-router-dom";
import { MainLayout, TransitionLayout } from "@/layouts";
import { RecruiterHomePage } from "@/pages";

import { useUserStore } from "@/stores/useUserStore";

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

  // 1. Chưa đăng nhập → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Applicant không được phép → HomePage
  if (user.role === "applicant") {
    return <Navigate to="/" replace />;
  }

  // 3. Recruiter + Admin → OK
  return <Outlet />;
}

// Danh sách route cần login
export function ProtectedRoutes() {
  return (
    <Route element={<TransitionLayout />}>
      {/* Cần token */}
      <Route element={<ProtectedRouteGuard />}>
        <Route element={<MainLayout />}>
          {/* =============================================
               CÁC ROUTE CHUNG SAU KHI LOGIN (applicant / recruiter / admin)
             ============================================= */}

          {/* =============================================
               ROUTE DÀNH RIÊNG CHO RECRUITER & ADMIN
             ============================================= */}
          <Route element={<ProtectedRecruiterRoute />}>
            <Route path="/recruiter" element={<RecruiterHomePage />} />
            <Route path="/recruiter/jobs" element={<RecruiterHomePage />} />
            {/* Nếu bạn có thêm trang trong dashboard recruiter */}
            {/* <Route path="/recruiter/applicants" element={<ApplicantListPage />} /> */}
            {/* <Route path="/recruiter/company" element={<CompanyInfoPage />} /> */}
          </Route>

          {/* =============================================
               CÁC ROUTE BẢO VỆ KHÁC — thêm vào tùy bạn
             ============================================= */}
        </Route>
      </Route>
    </Route>
  );
}
