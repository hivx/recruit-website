import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { logo } from "@/assets";
import { useAppNavigate } from "@/hooks";
import { useUserStore } from "@/stores/useUserStore";
import { resolveImage } from "@/utils";

export function Navbar() {
  const { user, clearUser } = useUserStore();
  const navigate = useAppNavigate();
  const avatarSrc = resolveImage(user?.avatar);

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  function handleLogout() {
    clearUser();
    navigate("/login");
  }

  // Close dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/jobs" className="flex items-center gap-2">
          <img src={logo} alt="logo" className="h-10 w-auto rounded-md" />
          <span className="text-xl font-bold text-blue-600">SSMART</span>
        </Link>

        {/* Avatar + name + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((s) => !s)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            <img
              src={avatarSrc}
              alt="avatar"
              className="h-10 w-10 rounded-full object-cover border"
            />

            <span className="font-medium text-gray-700">{user?.name}</span>

            <ChevronDown className="w-5 h-5 text-gray-500" />
          </button>

          {/* DROPDOWN */}
          {open && (
            <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-xl border p-4 z-50">
              {/* User info */}
              <div className="flex gap-3">
                <img
                  src={avatarSrc || "/placeholder-avatar.png"}
                  alt="avatar"
                  className="h-14 w-14 rounded-full object-cover"
                />

                <div className="flex flex-col">
                  <p className="font-bold text-gray-800">{user?.name}</p>
                  <p className="text-sm text-gray-500">
                    {user?.isVerified
                      ? "Tài khoản đã xác thực"
                      : "Chưa xác thực"}
                  </p>
                  <p className="text-xs text-gray-400">
                    ID {user?.id} — {user?.email}
                  </p>
                </div>
              </div>

              <div className="border-t my-3"></div>

              {/* Profile page */}
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/profile");
                }}
                className="w-full text-left px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Trang cá nhân
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-2 py-2 text-red-600 hover:bg-red-100 rounded-lg font-medium"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
