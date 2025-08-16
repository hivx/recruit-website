

4. Quản lý state (React Query + Zustand)

React Query: quản lý data từ server (jobs, job detail).

Zustand: quản lý state client (user info, filter, theme, modal...).

Ví dụ store/useAuth.ts:

import { create } from "zustand";

interface AuthState {
  user: { id: string; name: string } | null;
  setUser: (user: AuthState["user"]) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

✅ 5. Kế hoạch tính năng tiếp theo

Sau khi đã có Jobs cơ bản, roadmap nên là:

Auth (Login/Signup) → để gắn user với job post.

CRUD Job

Tạo job (chỉ user login mới tạo được).

Sửa/Xóa job (chỉ chủ job mới có quyền).

Job filter & search

Lọc theo company, location, tags, salary range.

Sắp xếp theo createdAt.

Ứng tuyển (Apply)

Người dùng có thể nộp CV/ứng tuyển job.

Dashboard

Admin/User xem các job đã tạo, ứng tuyển.