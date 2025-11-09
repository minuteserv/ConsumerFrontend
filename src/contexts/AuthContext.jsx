import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/constants';

const AuthContext = createContext(null);

// User data storage key (only user info, not tokens)
const USER_STORAGE_KEY = 'minuteserv_user';

// Load user data from localStorage (backup cache)
function loadUserFromStorage() {
  try {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading user from localStorage:', error);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(() => loadUserFromStorage());
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial auth check
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Prevent infinite loops

  // Define logout function first (before useEffect that uses it)
  const logout = useCallback(async () => {
    // CRITICAL: Prevent infinite loops - if already logging out, return immediately
    if (isLoggingOut) {
      console.warn('🚪 [AuthContext] Logout already in progress, skipping...');
      return;
    }

    // CRITICAL: If already logged out, don't make API call
    if (!isAuthenticated && !user) {
      console.warn('🚪 [AuthContext] Already logged out, skipping API call');
      return;
    }

    setIsLoggingOut(true);

    try {
      // Only call backend logout if user is authenticated
      // Skip API call if session is already expired (prevents infinite loop)
      if (isAuthenticated || user) {
        try {
          // Call backend logout to clear HttpOnly cookies
          // Use a timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Logout timeout')), 5000)
          );
          
          await Promise.race([
            apiClient.post(API_ENDPOINTS.logout),
            timeoutPromise
          ]);
        } catch (error) {
          // CRITICAL: If logout API fails (401, network error, etc.), 
          // just continue with local logout - don't retry or throw
          // This prevents infinite loops when session is already expired
          if (error.status === 401 || 
              error.message?.includes('Session expired') ||
              error.message?.includes('expired') ||
              error.message?.includes('Logout timeout')) {
            console.warn('🚪 [AuthContext] Session already expired, skipping API logout');
          } else {
            console.error('🚪 [AuthContext] Error during logout API call:', error.message);
          }
          // Continue with logout even if API call fails
        }
      }
    } finally {
      // Always clear local state, even if API call failed
      setIsAuthenticated(false);
      setUser(null);
      
      // Clear user data from localStorage
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      } catch (error) {
        console.error('🚪 [AuthContext] Error clearing user from localStorage:', error);
      }

      // Reset logging out flag after a short delay to prevent race conditions
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 1000);
    }
  }, [isAuthenticated, user, isLoggingOut]);

  // Verify authentication status on mount (check if cookies are valid)
  // This will automatically refresh tokens if access token is expired
  // YouTube-style persistent login: Only logout if refresh token is actually expired
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Step 1: Restore user from localStorage first (for instant UI - YouTube approach)
        const cachedUser = loadUserFromStorage();
        
        // FIX: Check if user has valid ID (not undefined or null)
        if (cachedUser && cachedUser.id && cachedUser.id !== 'undefined') {
          setIsAuthenticated(true);
          setUser(cachedUser);
        } else {
          // Clear invalid cached user
          if (cachedUser && (!cachedUser.id || cachedUser.id === 'undefined')) {
            try {
              if (typeof window !== 'undefined') {
                localStorage.removeItem(USER_STORAGE_KEY);
              }
            } catch (e) {
              console.error('🔐 [AuthContext] Error clearing invalid cache:', e);
            }
          }
        }
        
        // Step 2: Call /auth/me to verify if user is authenticated (cookies are automatically sent)
        // API client will automatically refresh token if access token is expired
        // NOTE: HttpOnly cookies are automatically sent with requests (credentials: 'include')
        const response = await apiClient.get(API_ENDPOINTS.getCurrentUser);
        
        if (response && response.id) {
          // User is authenticated - update user data
          setIsAuthenticated(true);
          const userObj = {
            id: response.id,
            phone_number: response.phone_number,
            name: response.name || '',
            email: response.email || '',
            is_verified: response.is_verified,
            createdAt: response.created_at || new Date().toISOString(),
          };
          setUser(userObj);
          // User data will be saved to localStorage by the useEffect below
        } else {
          // No user data returned - cookies might be invalid
          // Only clear if we don't have cached user (defensive)
          const cachedUser = loadUserFromStorage();
          if (!cachedUser || !cachedUser.id) {
            setIsAuthenticated(false);
            setUser(null);
          } else {
            setIsAuthenticated(true);
            setUser(cachedUser);
          }
        }
      } catch (error) {
        console.error('🔐 [AuthContext] ❌ Auth check error:', {
          message: error.message,
          status: error.status,
          name: error.name,
          stack: error.stack?.substring(0, 500)
        });
        
        // Only logout if refresh token is ACTUALLY expired (401 after refresh attempt)
        // Check error status code - if it's 401, it means refresh token failed
        const isAuthError = error.status === 401 || 
                           error.message?.includes('Session expired') || 
                           error.message?.includes('Invalid or expired token') ||
                           error.message?.includes('Token refresh failed');
        
        if (isAuthError) {
          // Check if API client attempted refresh and it failed
          // This means refresh token is actually expired
          const cachedUser = loadUserFromStorage();
          
          // CRITICAL FIX: Only logout if refresh token refresh actually failed with 401
          // If it's just a network error during refresh, keep user logged in
          const isRefreshTokenExpired = error.status === 401 && 
                                       (error.message?.includes('Session expired') || 
                                        error.message?.includes('Invalid or expired token'));
          
          if (isRefreshTokenExpired && (!cachedUser || !cachedUser.id)) {
            // Refresh token is actually expired AND no cached user - definitely logout
            setIsAuthenticated(false);
            setUser(null);
            try {
              if (typeof window !== 'undefined') {
                localStorage.removeItem(USER_STORAGE_KEY);
              }
            } catch (e) {
              console.error('🔐 [AuthContext] Error clearing localStorage:', e);
            }
          } else {
            // Keep user logged in - either refresh token is still valid OR we have cache
            if (cachedUser && cachedUser.id) {
              setIsAuthenticated(true);
              setUser(cachedUser);
            }
          }
        } else {
          // Network error or other non-auth errors - KEEP USER LOGGED IN (YouTube approach)
          // This ensures persistence even if network is temporarily down
          const cachedUser = loadUserFromStorage();
          if (cachedUser && cachedUser.id) {
            setIsAuthenticated(true);
            setUser(cachedUser);
          } else {
            // No cached user - might be first load
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // Run only on mount

  // Listen for logout events from API client (token refresh failure)
  useEffect(() => {
    const handleLogout = async () => {
      // CRITICAL: Prevent infinite loops - check if already logging out
      if (isLoggingOut) {
        console.warn('🚪 [AuthContext] Logout event received but already logging out, ignoring...');
        return;
      }
      await logout();
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [logout, isLoggingOut]);

  // Save user data to localStorage
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (error) {
      console.error('💾 [AuthContext] Error saving user to localStorage:', error);
    }
  }, [user]);

  const login = useCallback((userData) => {
    // Tokens are now set in HttpOnly cookies by backend
    // No need to store tokens client-side
    
    setIsAuthenticated(true);
    
    // Set user data from backend response
    // Backend returns user object after OTP verification
    const userInfo = userData.user || {
      phoneNumber: userData.phoneNumber,
      name: userData.name || '',
      email: userData.email || '',
      id: userData.id || userData.user?.id,
    };
    
    // CRITICAL FIX: Validate user data before saving
    if (!userInfo || !userInfo.id) {
      console.error('🔑 [AuthContext] Invalid user data - missing ID:', userInfo);
      throw new Error('Invalid user data: missing user ID');
    }
    
    const userObj = {
      id: userInfo.id,
      phone_number: userInfo.phone_number || userInfo.phoneNumber,
      name: userInfo.name || '',
      email: userInfo.email || '',
      is_verified: userInfo.is_verified !== undefined ? userInfo.is_verified : true,
      createdAt: userInfo.created_at || new Date().toISOString(),
    };
    
    // Immediately save to localStorage for persistence
    setUser(userObj);
    
    // Force save to localStorage immediately (before useEffect runs)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userObj));
      }
    } catch (error) {
      console.error('🔑 [AuthContext] Error saving user to localStorage on login:', error);
    }
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((prev) => ({
      ...prev,
      ...userData,
    }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        updateUser,
        isLoading, // Expose loading state
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

