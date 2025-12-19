// src/components/profile/ApplicationsCard.tsx
import { motion } from "framer-motion";
import { FileText, Calendar, FileDown, Briefcase } from "lucide-react";
import { useState } from "react";
import { ApplicationStatusBadge, EditApplicationModal } from "@/components";
import { useMyApplications, useAppNavigate } from "@/hooks";
import type { Application } from "@/types";
import { resolveImage, formatDateDMY } from "@/utils";

/* ================================
   1) CARD CHÍNH
================================ */
export function MyApplicationsCard() {
  const { data, isLoading, error } = useMyApplications();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        relative rounded-3xl border bg-white p-7 shadow-md
        hover:shadow-xl transition-all duration-300 overflow-hidden
      "
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-white opacity-70 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 mb-5 flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-300 blur-xl opacity-40 rounded-full"></div>
          <FileText size={26} className="text-blue-600 relative z-10" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          Đơn ứng tuyển của tôi
        </h2>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm mt-4">
          Không thể tải danh sách đơn ứng tuyển.
        </p>
      )}

      {/* Empty */}
      {data?.total === 0 && (
        <div className="text-black text-center py-10 text-sm">
          Bạn chưa ứng tuyển công việc nào.
        </div>
      )}

      {/* List */}
      {data?.applications && data.applications.length > 0 && (
        <div className="grid grid-cols-1 gap-5">
          {data.applications.map((app) => (
            <ApplicationItem key={app.id} app={app} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ================================
   2) ITEM
================================ */
function ApplicationItem({ app }: { readonly app: Application }) {
  const [openEdit, setOpenEdit] = useState(false);
  const navigate = useAppNavigate();

  const canEdit = app.status === "pending";

  return (
    <>
      <motion.div
        whileHover={canEdit ? { scale: 1.02, translateY: -3 } : undefined}
        transition={{ type: "spring", stiffness: 180, damping: 17 }}
        onClick={() => {
          if (canEdit) {
            setOpenEdit(true);
          }
        }}
        className={`
          relative rounded-xl border bg-white p-5 shadow-sm
          transition-all duration-300
          ${
            canEdit
              ? "cursor-pointer hover:shadow-lg hover:border-blue-300"
              : "cursor-default opacity-90"
          }
        `}
      >
        {/* Decorative glow */}
        <div className="absolute -top-2 -right-2 w-16 h-16 bg-blue-100 blur-2xl opacity-40 rounded-full pointer-events-none" />

        {/* TITLE */}
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
          {app.job?.title ?? "Không rõ công việc"}
        </h3>

        {/* STATUS */}
        <div className="mt-3">
          <ApplicationStatusBadge status={app.status} />
        </div>

        {/* DATE */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
          <Calendar size={14} />
          <span>Nộp lúc: {formatDateDMY(app.createdAt)}</span>
        </div>

        {/* ACTIONS */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
          {/* View job */}
          {app.job?.id && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/jobs/${app.job?.id}`);
              }}
              className="
                inline-flex items-center gap-1
                text-blue-600 hover:text-blue-700 hover:underline cursor-pointer
              "
            >
              <Briefcase size={14} />
              Xem công việc
            </button>
          )}

          {/* CV LINK */}
          {app.cv && (
            <a
              href={resolveImage(app.cv)}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="
                inline-flex items-center gap-1
                text-blue-600 hover:underline
              "
            >
              <FileDown size={14} />
              Xem CV đã nộp
            </a>
          )}
        </div>

        {/* Hint */}
        {canEdit && (
          <p className="mt-3 text-xs text-blue-500">
            Nhấn vào thẻ để chỉnh sửa hồ sơ ứng tuyển
          </p>
        )}
      </motion.div>

      {/* EDIT MODAL */}
      {canEdit && (
        <EditApplicationModal
          open={openEdit}
          application={app}
          onClose={() => setOpenEdit(false)}
        />
      )}
    </>
  );
}
