import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from './auth';

interface LoginInput {
  username?: string;
  email?: string;
  password: string;
}

export function useLoginMutation() {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error?.message || 'Login failed');
      }
      login(data.data.token, data.data.user);
      return data.data.user;
    },
  });
} 