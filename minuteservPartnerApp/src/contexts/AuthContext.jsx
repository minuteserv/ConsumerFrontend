import { createContext, useContext, useState, useEffect } from 'react';
import { getPartnerProfile } from '@/lib/api';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/constants';

const AuthContext = createContext(null);

const SESSION_STORAGE_KEY = 'partner_session';

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [partner, setPartner] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  /**
   * Get session from localStorage
   */
  function getSession() {
    try {
      const session = localStorage.getItem(SESSION_STORAGE_KEY);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Save session to localStorage
   */
  function saveSession(partnerData) {
    try {
      const session = {
        partner: partnerData,
        isAuthenticated: true,
        timestamp: Date.now(),
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  /**
   * Clear session from localStorage
   */
  function clearSession() {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  /**
   * Check if partner has valid session
   */
  async function checkSession() {
    setIsLoading(true);
    const session = getSession();

    if (session && session.partner) {
      try {
        // Verify session with backend
        const profile = await getPartnerProfile();
        setIsAuthenticated(true);
        setPartner(profile.partner || profile);
        saveSession(profile.partner || profile);
      } catch (error) {
        // Session invalid, clear it
        clearSession();
        setIsAuthenticated(false);
        setPartner(null);
      }
    } else {
      setIsAuthenticated(false);
      setPartner(null);
    }

    setIsLoading(false);
  }

  /**
   * Login - called after OTP verification
   */
  function login(partnerData) {
    saveSession(partnerData);
    setIsAuthenticated(true);
    setPartner(partnerData);
    return { success: true };
  }

  /**
   * Logout
   */
  async function logout() {
    try {
      // Call logout endpoint to clear cookies
      await apiClient.post(API_ENDPOINTS.partnerLogout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSession();
      setIsAuthenticated(false);
      setPartner(null);
    }
  }

  const value = {
    isAuthenticated,
    isLoading,
    partner,
    login,
    logout,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

