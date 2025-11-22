import { useAuthStore } from '../stores/authStore';

export const useRole = () => {
  const { user } = useAuthStore();
  
  return {
    isAdmin: user?.role === 'doctor' || user?.role === 'admin',
    isPatient: user?.role === 'patient',
    isDoctor: user?.role === 'doctor',
  };
};

