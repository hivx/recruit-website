// src/components/admin/AdminUserList.tsx
import { Switch } from "@headlessui/react";
import { useState } from "react";
import { ConfirmPopup, Loader } from "@/components";
import { AdminUserForm } from "@/components/admin";
import {
  useAdminUsers,
  useAdminSetUserActive,
  useAdminCreateUser,
  useAdminUpdateUser,
  useAdminDeleteUser,
} from "@/hooks";
import type { User, AdminCreateUserPayload } from "@/types";

type ActionMode = "view" | "edit" | "delete" | "create";

export function AdminUserList() {
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<ActionMode>("view");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data, isLoading, refetch } = useAdminUsers({
    page,
    limit: 10,
  });

  const setActiveMutation = useAdminSetUserActive();
  const createUserMutation = useAdminCreateUser();
  const updateUserMutation = useAdminUpdateUser();
  const deleteUserMutation = useAdminDeleteUser();
  const isActionMode = mode === "edit" || mode === "delete";

  const users = data?.users ?? [];
  const totalPages = data?.totalPages ?? 1;

  const ROLE_BADGE_CLASS: Record<string, string> = {
    admin: "bg-indigo-100 text-indigo-700",
    recruiter: "bg-green-100 text-green-700",
    applicant: "bg-blue-100 text-blue-700",
  };

  function handleRowClick(user: User) {
    if (mode === "edit") {
      setSelectedUser(user);
      return;
    }

    if (mode === "delete") {
      setSelectedUser(user);
      setConfirmOpen(true);
    }
  }

  async function handleConfirmDelete() {
    if (!selectedUser) {
      return;
    }

    await deleteUserMutation.mutateAsync({ userId: selectedUser.id });
    setConfirmOpen(false);
    setSelectedUser(null);
    setMode("view");
    void refetch();
  }

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-14">
        <Loader size={28} />
      </div>
    );
  }

  function handleCreateUser(payload: AdminCreateUserPayload) {
    createUserMutation.mutate(payload, {
      onSuccess: () => {
        setMode("view");
        void refetch();
      },
    });
  }

  function handleUpdateUser(
    payload: Parameters<typeof updateUserMutation.mutate>[0]["payload"],
  ) {
    if (!selectedUser) {
      return;
    }

    updateUserMutation.mutate(
      {
        userId: selectedUser.id,
        payload,
      },
      {
        onSuccess: () => {
          setMode("view");
          setSelectedUser(null);
          void refetch();
        },
      },
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        {/* ================= ACTION BAR ================= */}
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode("create");
              setSelectedUser(null);
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition cursor-pointer"
          >
            + Tạo mới
          </button>

          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
              mode === "edit"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Sửa
          </button>

          <button
            type="button"
            onClick={() => setMode("delete")}
            className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
              mode === "delete"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Xóa
          </button>

          {mode !== "view" && (
            <button
              type="button"
              onClick={() => {
                setMode("view");
                setSelectedUser(null);
              }}
              className="ml-auto text-sm text-gray-500 hover:underline transition cursor-pointer"
            >
              Thoát chế độ
            </button>
          )}
        </div>

        {/* ================= MODE HINT ================= */}
        {mode !== "view" && (
          <div
            className={`mb-4 px-4 py-2 rounded-lg text-sm font-medium ${
              mode === "delete"
                ? "bg-red-50 text-red-700"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            {mode === "edit" && "Chế độ sửa: Click vào user để chỉnh sửa"}
            {mode === "delete" && "Chế độ xóa: Click vào user để xóa"}
            {mode === "create" && "Tạo người dùng mới"}
          </div>
        )}

        {/* ================= FORM ================= */}
        {mode === "create" && (
          <AdminUserForm
            mode="create"
            loading={createUserMutation.isPending}
            onSubmit={handleCreateUser}
            onCancel={() => setMode("view")}
          />
        )}

        {mode === "edit" && selectedUser && (
          <AdminUserForm
            mode="edit"
            initialData={selectedUser}
            loading={updateUserMutation.isPending}
            onSubmit={handleUpdateUser}
            onCancel={() => {
              setMode("view");
              setSelectedUser(null);
            }}
          />
        )}

        {/* ================= TABLE ================= */}
        <div className="overflow-x-auto mt-6">
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
              {users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => handleRowClick(u)}
                  className={`
                    hover:bg-gray-50 transition
                    ${isActionMode ? "cursor-pointer" : ""}
                  `}
                >
                  <td className="px-6 py-4 font-medium">{u.name || "—"}</td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ROLE_BADGE_CLASS[u.role]
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td
                    className="px-6 py-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Switch
                      checked={u.isVerified}
                      disabled={setActiveMutation.isPending}
                      onChange={(checked) =>
                        setActiveMutation.mutate({
                          userId: u.id,
                          payload: { isActive: checked },
                        })
                      }
                      className={`${
                        u.isVerified ? "bg-blue-600" : "bg-gray-300"
                      } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                    >
                      <span
                        className={`${
                          u.isVerified ? "translate-x-6" : "translate-x-1"
                        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                      />
                    </Switch>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION ================= */}
        <div className="flex justify-center items-center gap-6 pt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg border bg-white disabled:opacity-40"
          >
            ← Trước
          </button>

          <span className="font-semibold">
            {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-40"
          >
            Sau →
          </button>
        </div>
      </div>

      {/* ================= CONFIRM DELETE ================= */}
      <ConfirmPopup
        open={confirmOpen}
        title="Xóa người dùng"
        message={`Bạn có chắc chắn muốn xóa user "${selectedUser?.email}" không?`}
        loading={deleteUserMutation.isPending}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
