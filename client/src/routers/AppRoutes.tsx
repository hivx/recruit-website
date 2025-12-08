// src/routers/AppRoutes.tsx
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PublicRoutes, ProtectedRoutes, AuthRoutes } from "@/routers";
import { useUserStore } from "@/stores";

export function AppRouter() {
  useEffect(() => {
    const { token, fetchUser } = useUserStore.getState();

    if (!token) {
      return;
    }

    const onFocus = () => void fetchUser();
    window.addEventListener("focus", onFocus);

    return () => window.removeEventListener("focus", onFocus);
  }, []);

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
