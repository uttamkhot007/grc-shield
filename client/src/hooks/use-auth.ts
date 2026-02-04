import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";
import { apiRequest } from "@/lib/queryClient";

async function fetchUser(): Promise<User | null> {
  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  user?: User;
  requiresMfa?: boolean;
  message: string;
}

interface MfaVerifyResponse {
  user: User;
  message: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const loginMutation = useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.user) {
        queryClient.setQueryData(["/api/auth/user"], data.user);
      }
    },
  });

  const verifyMfaMutation = useMutation<MfaVerifyResponse, Error, { code: string }>({
    mutationFn: async ({ code }) => {
      const res = await apiRequest("POST", "/api/auth/verify-mfa", { code });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data.user);
    },
  });

  const registerMutation = useMutation<{ user: User }, Error, RegisterData>({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    verifyMfa: verifyMfaMutation.mutateAsync,
    isVerifyingMfa: verifyMfaMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
