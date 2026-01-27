// web-ui/src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  login: (token: string) => void;
  logout: () => void;
  completeOnboarding: () => void;
  checkOnboardingStatus: () => void; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    setHasCompletedOnboarding(!!localStorage.getItem('hasCompletedOnboarding'));
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setHasCompletedOnboarding(!!localStorage.getItem('hasCompletedOnboarding'));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('hasCompletedOnboarding'); 
    setIsAuthenticated(false);
    setHasCompletedOnboarding(false);
    navigate('/');
  };

  const completeOnboarding = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setHasCompletedOnboarding(true);
  };

  const checkOnboardingStatus = () => {
    setHasCompletedOnboarding(!!localStorage.getItem('hasCompletedOnboarding'));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, hasCompletedOnboarding, login, logout, completeOnboarding, checkOnboardingStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
