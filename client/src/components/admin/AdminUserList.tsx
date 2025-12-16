// src/components/admin/AdminUserList.tsx
import { Switch } from "@headlessui/react";
import { useState } from "react";
import { useAdminUsers, useAdminSetUserActive } from "@/hooks";

export function AdminUserList() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminUsers({
    page,
    limit: 10,
  });

  const setActiveMutation = useAdminSetUserActive();

  const users = data?.users ?? [];
  const totalPages = data?.totalPages ?? 1;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow">
        Đang tải danh sách user...
      </div>
    );
  }
  const ROLE_BADGE_CLASS: Record<string, string> = {
    admin: "bg-indigo-100 text-indigo-700",
    recruiter: "bg-green-100 text-green-700",
    applicant: "bg-blue-100 text-blue-700",
  };

  const getRoleBadgeClass = (role: string) =>
    ROLE_BADGE_CLASS[role] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-800">
          Danh sách người dùng hệ thống
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-3 text-left">Tên</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Vai trò</th>
              <th className="px-6 py-3 text-center">Kích hoạt</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {users.map((u) => {
              const roleBadgeClass = getRoleBadgeClass(u.role);

              return (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {u.name || "—"}
                  </td>

                  <td className="px-6 py-4 text-gray-600">{u.email}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${roleBadgeClass}
          `}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <Switch
                      checked={u.isVerified}
                      disabled={setActiveMutation.isPending}
                      onChange={(checked) =>
                        setActiveMutation.mutate({
                          userId: u.id,
                          payload: { isActive: checked },
                        })
                      }
                      className={`
            ${u.isVerified ? "bg-blue-600" : "bg-gray-300"}
            relative inline-flex h-6 w-11 items-center rounded-full
            transition disabled:opacity-50
          `}
                    >
                      <span
                        className={`
              ${u.isVerified ? "translate-x-6" : "translate-x-1"}
              inline-block h-4 w-4 transform rounded-full bg-white transition
            `}
                      />
                    </Switch>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-6 pt-10 pb-6">
        {/* Prev */}
        <button
          type="button"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="
            flex items-center gap-2
            px-5 py-2.5 rounded-xl
            border border-gray-200
            bg-white text-gray-700 font-medium
            shadow-sm
            hover:bg-gray-50 hover:shadow
            disabled:opacity-40 disabled:cursor-not-allowed
            transition
          "
        >
          <span className="text-lg">←</span>
          Trang trước{" "}
        </button>

        {/* Page info */}
        <div
          className="
            px-4 py-2 rounded-xl
            bg-gray-100 text-gray-700 font-semibold
            shadow-inner
          "
        >
          {page}
          <span className="mx-1 text-gray-400">/</span>
          {totalPages}
        </div>

        {/* Next */}
        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="
            flex items-center gap-2
            px-5 py-2.5 rounded-xl
            bg-blue-600 text-white font-medium
            shadow-md
            hover:bg-blue-700 hover:shadow-lg
            disabled:bg-blue-300 disabled:cursor-not-allowed
            transition
          "
        >
          Trang sau <span className="text-lg">→ </span>
        </button>
      </div>
    </div>
  );
}
