import { AnimatePresence } from "framer-motion";
import { Routes, Route, Navigate } from "react-router-dom";
import { PublicRoutes, ProtectedRoutes, AuthRoutes } from "@/routers";

export function AppRouter() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public that everyone can access */}
        {PublicRoutes()}

        {/* Auth pages that logged-in users should NOT access */}
        {AuthRoutes()}

        {/* Protected pages (yêu cầu phải login) */}
        {ProtectedRoutes()}

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
