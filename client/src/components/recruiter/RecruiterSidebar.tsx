// src/components/recruiter/RecruiterSidebar.tsx
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  PanelLeftOpen,
  PanelLeftClose,
  SquarePen,
  Building2,
  UsersRound,
  UserSearch,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "Bài đăng của tôi", icon: SquarePen, to: "/recruiter/jobs" },
  { label: "Thông tin công ty", icon: Building2, to: "/recruiter/company" },
  { label: "Đơn ứng tuyển", icon: UsersRound, to: "/recruiter/applicants" },
  {
    label: "Ứng viên tiềm năng",
    icon: UserSearch,
    to: "/recruiter/recommended/candidates",
  },
];

export function RecruiterSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  // Smooth inertial scroll effect
  const { scrollY } = useScroll();
  const springY = useSpring(scrollY, {
    stiffness: 40,
    damping: 18,
    mass: 0.25,
  });

  // Limited motion range (0–16px)
  const sidebarFloat = useTransform(springY, (v) => Math.min(v / 8, 16));

  return (
    <motion.div
      layout
      style={{ y: sidebarFloat }} // correct placement for MotionValue
      animate={{ width: collapsed ? 78 : 260 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="
        bg-white shadow-lg border border-gray-200 rounded-xl
        max-h-[60vh] overflow-y-auto
        p-3 flex flex-col sticky top-24
      "
    >
      {/* Toggle */}
      <motion.button
        layout
        transition={{ duration: 0.25 }}
        onClick={() => setCollapsed(!collapsed)}
        className="p-3 mb-3 rounded-xl hover:bg-gray-100 transition flex justify-center"
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
              `flex items-center gap-4 px-4 py-3 rounded-xl font-medium
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
