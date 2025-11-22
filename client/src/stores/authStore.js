import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(api.auth.getCurrentUser());

  useEffect(() => {
    // Update user when localStorage changes
    const checkUser = () => {
      const currentUser = api.auth.getCurrentUser();
      setUser(currentUser);
    };
    
    // Check on mount
    checkUser();
    
    // Listen for storage changes (for multi-tab support)
    window.addEventListener('storage', checkUser);
    
    return () => {
      window.removeEventListener('storage', checkUser);
    };
  }, []);

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (newUser) => {
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, logout, setUser: updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthStore = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Fallback if not wrapped in provider
    return {
      user: api.auth.getCurrentUser(),
      logout: async () => {
        try {
          await api.auth.logout();
        } catch (error) {
          console.error('Logout error:', error);
        }
      },
      setUser: () => {},
    };
  }
  return context;
};

