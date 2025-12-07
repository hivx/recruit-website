// src/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { login, register, forgotPassword, getMe } from "@/services";
import { useUserStore } from "@/stores";
import type {
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  User,
} from "@/types";

export function useAuth() {
  const queryClient = useQueryClient();

  const { user, token, setUser, clearUser } = useUserStore();

  // -------- GET CURRENT USER --------
  const meQuery = useQuery<User, Error>({
    queryKey: ["auth-user"],
    queryFn: getMe,
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  });

  // Đồng bộ Zustand với react-query
  useEffect(() => {
    if (meQuery.data && token) {
      if (!user || user.id !== meQuery.data.id) {
        setUser(meQuery.data, token);
      }
    }

    // Nếu lỗi -> logout
    if (meQuery.error) {
      clearUser();
      queryClient.removeQueries({ queryKey: ["auth-user"] });
    }
  }, [
    clearUser,
    meQuery.data,
    meQuery.error,
    queryClient,
    setUser,
    token,
    user,
  ]);

  // -------- LOGIN --------
  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: async (res) => {
      setUser(res.user, res.token);
      await queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    },
  });

  // -------- REGISTER --------
  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
  });

  // -------- FORGOT PASSWORD --------
  const forgotPasswordMutation = useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPassword(payload),
  });

  // -------- LOGOUT --------
  const logout = () => {
    clearUser();
    queryClient.clear();
  };

  return {
    user: meQuery.data ?? null,
    token,
    isAuthenticated: !!token,

    // trạng thái chung
    isLoading: meQuery.isLoading || loginMutation.isPending,

    // trạng thái riêng theo action để UI disable button
    loginLoading: loginMutation.isPending,
    registerLoading: registerMutation.isPending,
    forgotPasswordLoading: forgotPasswordMutation.isPending,

    // actions
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    logout,

    error:
      meQuery.error ||
      loginMutation.error ||
      registerMutation.error ||
      forgotPasswordMutation.error,
  };
}
