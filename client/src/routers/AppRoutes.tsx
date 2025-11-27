import { Routes, Route, Navigate } from "react-router-dom";
import { PublicRoutes, ProtectedRoutes } from "@/routers";

export function AppRouter() {
  return (
    <Routes>
      {PublicRoutes()}
      {ProtectedRoutes()}

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
