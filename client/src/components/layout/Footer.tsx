// src/components/layout/Footer.tsx
import { FaFacebookF, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";
import { logo2 } from "@/assets";

export function Footer() {
  return (
    <footer
      className="
      relative
      bg-gradient-to-br from-blue-50 via-blue-300 to-blue-200
      text-black
    "
    >
      {/* ================= MAIN ================= */}
      <div
        className="
          max-w-7xl mx-auto px-6 py-14
          grid grid-cols-1 md:grid-cols-4 gap-10
        "
      >
        {/* ===== LOGO ===== */}
        <div className="space-y-6">
          <Link
            to="/home"
            className="
              inline-flex items-center
              transition-transform duration-300
              hover:scale-[1.03]
            "
          >
            <img
              src={logo2}
              alt="RSS Recruitment Platform"
              className="
                h-auto
                w-xl
                object-contain
                drop-shadow-md
              "
            />
          </Link>
        </div>

        {/* ===== ỨNG VIÊN ===== */}
        <div>
          <h4 className="font-semibold mb-4 tracking-wide">Ứng viên</h4>
          <ul className="space-y-2 text-sm text-black/80">
            {[
              { to: "/jobs", label: "Tìm việc làm" },
              { to: "/profile", label: "Hồ sơ cá nhân" },
              { to: "/profile", label: "Đơn ứng tuyển" },
            ].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="
                    inline-block
                    transition
                    hover:text-blue-700
                    hover:translate-x-1
                  "
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ===== NHÀ TUYỂN DỤNG ===== */}
        <div>
          <h4 className="font-semibold mb-4 tracking-wide">Nhà tuyển dụng</h4>
          <ul className="space-y-2 text-sm text-black/80">
            {[
              { to: "/recruiter", label: "Trang quản lý" },
              { to: "/recruiter/jobs", label: "Bài đăng tuyển" },
              { to: "/recruiter/company", label: "Thông tin công ty" },
            ].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="
                    inline-block
                    transition
                    hover:text-blue-700
                    hover:translate-x-1
                  "
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ===== HỆ THỐNG ===== */}
        <div>
          <h4 className="font-semibold mb-4 tracking-wide">Hệ thống</h4>
          <ul className="space-y-2 text-sm text-black/80">
            {[
              { to: "/admin", label: "Quản trị" },
              { to: "/admin/jobs", label: "Duyệt tuyển dụng" },
              { to: "/admin/companies", label: "Quản lý công ty" },
            ].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="
                    inline-block
                    transition
                    hover:text-blue-700
                    hover:translate-x-1
                  "
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ================= BOTTOM BAR ================= */}
      <div className="border-t border-black/10">
        <div
          className="
            max-w-7xl mx-auto px-6 py-4
            flex flex-col md:flex-row
            items-center justify-between gap-4
          "
        >
          <p className="text-sm text-black/60">
            © 2025 Recruitment Platform. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            {[
              { href: "https://facebook.com", icon: FaFacebookF },
              { href: "https://linkedin.com", icon: FaLinkedinIn },
              { href: "https://youtube.com", icon: FaYoutube },
            ].map(({ href, icon: Icon }, i) => (
              <a
                key={i + 1}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  p-2 rounded-full
                  border border-black/40
                  text-black
                  transition-all duration-300
                  hover:bg-white
                  hover:shadow-md
                  hover:scale-110
                "
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
