import { Link } from "react-router-dom";
import logo from "@/assets/iconH.png";
import { useAppNavigate } from "@/hooks";
import { useUserStore } from "@/stores/useUserStore";

export function Navbar() {
  const user = useUserStore((s) => s.user);
  const clearUser = useUserStore((s) => s.clearUser);
  const navigate = useAppNavigate();

  function handleLogout() {
    clearUser(); // Xóa user + token Zustand
    navigate("/login");
  }

  return (
    <nav className="w-full bg-white shadow-sm px-6 py-3 flex items-center justify-between">
      <Link to="/jobs" className="flex items-center gap-2">
        <img src={logo} alt="logo" className="h-10 w-auto" />
      </Link>

      <div className="flex items-center gap-4">
        {user && <span className="text-gray-700 font-medium">{user.name}</span>}

        <button
          onClick={handleLogout}
          className="text-sm bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600"
        >
          Đăng xuất
        </button>
      </div>
    </nav>
  );
}
