// src/components/profile/UserInfoCard.tsx
import { motion } from "framer-motion";
import { Pencil, Mail, Calendar, Building2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Loader, StatusBadge } from "@/components";
import { UserEditModal } from "@/components/profile";
import { useUserStore } from "@/stores";
import { resolveImage, formatDateDMY } from "@/utils";

function VerifiedBadge({ isVerified }: { isVerified: boolean }) {
  return isVerified ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 border border-green-200">
      <ShieldCheck size={12} />
      Đã xác thực
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700 border border-yellow-200">
      Chưa xác thực
    </span>
  );
}

function RoleBadge({ role }: { readonly role: string }) {
  const map: Record<string, string> = {
    admin: "bg-purple-50 text-purple-700 border border-purple-200",
    recruiter: "bg-blue-50 text-blue-700 border border-blue-200",
    candidate: "bg-gray-100 text-gray-700 border border-gray-200",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${map[role]}`}>
      {role}
    </span>
  );
}

export function UserInfoCard() {
  const user = useUserStore((s) => s.user);
  const [openEdit, setOpenEdit] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center rounded-xl border bg-white p-8 shadow-sm">
        <Loader size={22} />
      </div>
    );
  }

  const avatarUrl = resolveImage(user.avatar ?? undefined);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="
        flex flex-col md:flex-row md:items-center 
        justify-between gap-10
        p-10 rounded-3xl border shadow-lg bg-white relative overflow-hidden
        transition-all duration-500 hover:shadow-xl hover:-translate-y-[3px]
        min-h-[220px]
      "
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-purple-50 opacity-70 pointer-events-none" />

        {/* LEFT SECTION */}
        <div className="flex items-center gap-10 relative z-10">
          {/* Avatar with glow */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-blue-300 blur-2xl opacity-40"></div>
            <img
              src={avatarUrl}
              alt={user.name ?? "Người dùng"}
              className="h-28 w-28 md:h-32 md:w-32 rounded-full border-2 border-white shadow-xl object-cover relative z-10"
            />
          </div>

          {/* User info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <Mail size={18} />
                {user.email}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <RoleBadge role={user.role} />
              <VerifiedBadge isVerified={user.isVerified} />
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Details + Button */}
        <div className="space-y-4 text-gray-700 text-[15px] relative z-10">
          <div className="flex items-center gap-2">
            <Calendar size={18} />
            <span>
              <strong>Tham gia:</strong> {formatDateDMY(user.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={18} />
            <span>
              <strong>Cập nhật:</strong> {formatDateDMY(user.updatedAt)}
            </span>
          </div>

          {user.company && (
            <>
              <div className="flex items-center gap-2">
                <Building2 size={18} />
                <span className="font-semibold">{user.company.legalName}</span>
              </div>
              <p className="text-xs text-gray-500">
                Trạng thái:
                <StatusBadge status={user.company.verificationStatus} />
              </p>
            </>
          )}
        </div>

        {/* EDIT BUTTON */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpenEdit(true)}
          className="
          inline-flex items-center gap-2
          bg-blue-600 text-white cursor-pointer
          px-6 py-3 rounded-xl text-sm font-semibold 
          shadow-[0_4px_10px_rgba(0,0,0,0.15)]
          hover:shadow-[0_6px_14px_rgba(0,0,0,0.20)]
          transition-all
        "
        >
          <Pencil size={18} />
          Chỉnh sửa thông tin
        </motion.button>
      </motion.div>
      <UserEditModal open={openEdit} onClose={() => setOpenEdit(false)} />
    </div>
  );
}
