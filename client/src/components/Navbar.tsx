// src/components/Navbar.tsx
import { ChevronDown, User, KeyRound, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { logo } from "@/assets";
import { useAppNavigate } from "@/hooks";
import { useUserStore } from "@/stores";
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
    <nav className="w-full h-20 bg-white/90 backdrop-blur shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-full">
        {/* LOGO */}
        <Link to="/" className="h-full flex items-center">
          <img
            src={logo}
            alt="logo"
            className="h-[220%] w-auto object-contain block"
          />
        </Link>

        {/* NAVBAR RIGHT */}
        <div className="flex items-center gap-4">
          {/* CHƯA ĐĂNG NHẬP */}
          {!user && (
            <>
              <Link
                to="/register"
                className="
                  px-4 py-2 rounded-full border border-green-600 text-green-600 
                  font-medium hover:bg-green-50 hover:shadow-sm active:scale-95 
                  transition-all duration-150
                "
              >
                Đăng ký
              </Link>

              <Link
                to="/login"
                className="
                  px-4 py-2 rounded-full bg-green-600 text-white font-medium 
                  hover:bg-green-700 hover:shadow active:scale-95 
                  transition-all duration-150
                "
              >
                Đăng nhập
              </Link>

              <Link
                to="/employer"
                className="
                  px-4 py-2 rounded-full bg-gray-100 text-gray-700 
                  hover:bg-gray-200 hover:shadow-sm active:scale-95 
                  transition-all duration-150
                "
              >
                Đăng tin tuyển dụng ngay!
              </Link>
            </>
          )}

          {/* ĐÃ ĐĂNG NHẬP */}
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpen((s) => !s)}
                className="
                  flex items-center gap-3 px-3 py-2 rounded-lg 
                  hover:bg-gray-100 
                  transition-all duration-150 cursor-pointer
                "
              >
                <img
                  src={avatarSrc}
                  onError={(e) => {
                    e.currentTarget.src = resolveImage(null); // fallback ảnh mặc định
                  }}
                  alt="avatar"
                  className="
                    h-10 w-10 rounded-full object-cover border 
                    hover:shadow-md hover:scale-[1.03] transition-all duration-200
                  "
                />

                <span className="font-medium text-gray-700">{user.name}</span>

                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* DROPDOWN */}
              {open && (
                <div
                  className="
                    absolute right-0 mt-3 w-72
                    rounded-xl border bg-white p-4
                    shadow-xl z-50
                    animate-fade-slide
                  "
                >
                  {/* User info */}
                  <div className="flex gap-3">
                    <img
                      src={avatarSrc}
                      onError={(e) => {
                        e.currentTarget.src = resolveImage(null);
                      }}
                      alt="avatar"
                      className="h-14 w-14 rounded-full object-cover shadow-sm"
                    />

                    <div className="flex flex-col">
                      <p className="font-bold text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">
                        {user.isVerified
                          ? "Tài khoản đã xác thực"
                          : "Chưa xác thực"}
                      </p>
                      <p className="text-xs text-gray-400">
                        ID {user.id} — {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="my-3 border-t" />

                  {/* Profile */}
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/profile");
                    }}
                    className="
                      group flex w-full items-center gap-3
                      rounded-lg px-2 py-2
                      text-left text-gray-700
                      transition cursor-pointer
                      hover:bg-gray-100
                    "
                  >
                    <User
                      size={18}
                      className="
                        text-gray-400
                        transition
                        group-hover:text-gray-700
                      "
                    />
                    <span className="text-sm font-medium">Trang cá nhân</span>
                  </button>

                  {/* Change password */}
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/change-password");
                    }}
                    className="
                      group flex w-full items-center gap-3
                      rounded-lg px-2 py-2
                      text-left text-blue-600
                      transition cursor-pointer
                      hover:bg-blue-50
                    "
                  >
                    <KeyRound
                      size={18}
                      className="
                        text-blue-400
                        transition
                        group-hover:text-blue-600
                      "
                    />
                    <span className="text-sm font-medium">Đổi mật khẩu</span>
                  </button>

                  <div className="my-2 border-t" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="
                      group flex w-full items-center gap-3
                      rounded-lg px-2 py-2
                      text-left text-red-600 font-medium
                      transition cursor-pointer
                      hover:bg-red-100
                    "
                  >
                    <LogOut
                      size={18}
                      className="
                        text-red-400
                        transition
                        group-hover:text-red-600
                      "
                    />
                    <span className="text-sm">Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
