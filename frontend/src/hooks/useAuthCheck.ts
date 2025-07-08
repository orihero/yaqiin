import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useAuthCheck() {
  const { t } = useTranslation();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthError(t('auth.relaunchRequired'));
    }
  }, [t]);

  return { authError };
} 