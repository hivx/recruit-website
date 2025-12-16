// src/components/admin/AdminSidebar.tsx
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  PanelLeftOpen,
  PanelLeftClose,
  LayoutDashboard,
  SquarePen,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    label: "Bảng điều khiển",
    icon: LayoutDashboard,
    to: "/admin/dashboard",
  },
  {
    label: "Danh sách bài đăng",
    icon: SquarePen,
    to: "/admin/jobs",
  },
  {
    label: "Danh sách công ty",
    icon: Building2,
    to: "/admin/companies",
  },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  // Smooth inertial scroll effect (giữ đồng bộ với RecruiterSidebar)
  const { scrollY } = useScroll();
  const springY = useSpring(scrollY, {
    stiffness: 40,
    damping: 18,
    mass: 0.25,
  });

  // Sidebar floating nhẹ theo scroll (0–16px)
  const sidebarFloat = useTransform(springY, (v) => Math.min(v / 8, 16));

  return (
    <motion.div
      layout
      style={{ y: sidebarFloat }}
      animate={{ width: collapsed ? 78 : 260 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="
        bg-white shadow-lg border border-gray-200 rounded-xl
        max-h-[60vh] overflow-y-auto
        p-3 flex flex-col sticky top-24
      "
    >
      {/* Toggle collapse */}
      <motion.button
        layout
        transition={{ duration: 0.25 }}
        onClick={() => setCollapsed(!collapsed)}
        className="
          p-3 mb-3 rounded-xl
          hover:bg-gray-100 transition
          flex justify-center
        "
      >
        {collapsed ? (
          <PanelLeftOpen className="w-6 h-6 text-gray-600" />
        ) : (
          <PanelLeftClose className="w-6 h-6 text-gray-600" />
        )}
      </motion.button>

      {/* Menu */}
      <nav className="flex flex-col gap-2">
        {menuItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `
              flex items-center gap-4 px-4 py-3 rounded-xl font-medium
              transition-all
              ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }
            `
            }
          >
            <motion.div layout>
              <Icon className="w-5 h-5" />
            </motion.div>

            {!collapsed && (
              <motion.span layout transition={{ duration: 0.25 }}>
                {label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>
    </motion.div>
  );
}
