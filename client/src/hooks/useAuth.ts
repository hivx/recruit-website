import { useMutation } from "@tanstack/react-query";
import { login, register, forgotPassword, getMe } from "@/services";
import { useUserStore } from "@/stores";

export function useAuth() {
  const { user, token, setUser, clearUser } = useUserStore();

  // LOGIN
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (res) => {
      setUser(res.user, res.token);
    },
  });

  // REGISTER
  const registerMutation = useMutation({
    mutationFn: register,
  });

  // FORGOT PASSWORD
  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,
  });

  // LOGOUT
  const logout = () => {
    clearUser();
  };

  // FETCH USER MANUALLY WHEN NEEDED (ví dụ trong Profile)
  const refreshUser = async () => {
    const me = await getMe();
    setUser(me, token);
  };

  return {
    user,
    token,
    isAuthenticated: !!token,

    login: loginMutation.mutateAsync,
    loginLoading: loginMutation.isPending,

    register: registerMutation.mutateAsync,
    registerLoading: registerMutation.isPending,

    forgotPassword: forgotPasswordMutation.mutateAsync,
    forgotPasswordLoading: forgotPasswordMutation.isPending,

    logout,
    refreshUser,

    isLoading: loginMutation.isPending,
    error:
      loginMutation.error ||
      registerMutation.error ||
      forgotPasswordMutation.error,
  };
}
