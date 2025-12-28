

// Custom hook for authentication and user session management

import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { UserSession } from '../types';

export function useAuth() {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user session on mount
  useEffect(() => {
    const savedSession = storage.getCurrentUserSession();
    if (savedSession && savedSession.isLoggedIn) {
      setUserSession(savedSession);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new user session
      const session: UserSession = {
        email: email.toLowerCase().trim(),
        isLoggedIn: true,
        loginTime: Date.now()
      };
      
      // Save session to storage
      storage.setCurrentUserSession(session);
      setUserSession(session);
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = (): void => {
    // Clear user session
    storage.setCurrentUserSession(null);
    setUserSession(null);
  };

  const getCurrentUserEmail = (): string | null => {
    return userSession?.email || null;
  };

  const isAuthenticated = (): boolean => {
    return userSession?.isLoggedIn === true;
  };

  return {
    userSession,
    loading,
    login,
    logout,
    getCurrentUserEmail,
    isAuthenticated,
  };
}

