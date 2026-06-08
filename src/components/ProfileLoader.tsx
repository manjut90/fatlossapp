import {
  useEffect,
} from 'react';

import {
  useAuth,
} from '../context/AuthContext';

export default function ProfileLoader() {
  const { refreshProfile } =
    useAuth();

  useEffect(() => {
    refreshProfile?.();
  }, []);

  return null;
}
