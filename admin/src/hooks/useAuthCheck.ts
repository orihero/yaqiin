import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../services/userService';

export function useAuthCheck() {
  const navigate = useNavigate();
  const { data: user, error, isError, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    retry: false,
  });

  useEffect(() => {
    if (isError && (error as any)?.response?.status === 401) {
      navigate('/login', { replace: true });
    }
  }, [isError, error, navigate]);

  return { user, isLoading, isError, error };
} 