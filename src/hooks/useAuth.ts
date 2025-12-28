

// Custom hook for authentication and user session management

import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { UserSession } from '../types';

export function useAuth() {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user session on mount
  useEffect(() => {
    try {
      console.log('🔐 Checking for existing user session...');
      const savedSession = storage.getCurrentUserSession();
      console.log('Saved session:', savedSession);
      
      if (savedSession && savedSession.isLoggedIn) {
        setUserSession(savedSession);
        console.log('✅ Restored user session:', savedSession.email);
      } else {
        console.log('👤 No valid session found, user needs to login');
      }
    } catch (error) {
      console.error('❌ Error loading user session:', error);
      setError('Failed to load user session');
    } finally {
      setLoading(false);
      console.log('🔓 Auth loading complete');
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 Attempting login for:', email);
    setLoading(true);
    setError(null);
    
    try {
      // Basic validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (password.length < 3) {
        throw new Error('Password must be at least 3 characters');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new user session
      const session: UserSession = {
        email: email.toLowerCase().trim(),
        isLoggedIn: true,
        loginTime: Date.now()
      };
      
      console.log('💾 Saving session to storage...');
      
      // Save session to storage
      storage.setCurrentUserSession(session);
      setUserSession(session);
      
      console.log('✅ Login successful for:', session.email);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };

  const logout = (): void => {
    console.log('🚪 Logging out user:', userSession?.email);
    try {
      // Clear user session
      storage.setCurrentUserSession(null);
      setUserSession(null);
      setError(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
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
    error,
    login,
    logout,
    getCurrentUserEmail,
    isAuthenticated,
  };
}

