/**
 * ProtectedRoute Component
 * 
 * Visa/Mastercard-level security: Ensures only authenticated users can access protected routes.
 * 
 * Security Features:
 * - Route-level authentication check
 * - Automatic redirect to login if not authenticated
 * - Loading state handling
 * - Prevents unauthorized access to cart/checkout
 * - Multiple layers of security
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from './LoginModal';
import { useState, useEffect } from 'react';

export function ProtectedRoute({ children, requireAuth = true }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // CRITICAL SECURITY: Log all access attempts
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && requireAuth) {
        console.warn('[ProtectedRoute] ⚠️ CRITICAL SECURITY: Unauthenticated access attempt to:', location.pathname);
      } else if (isAuthenticated) {
        console.log('[ProtectedRoute] ✓ Authenticated access granted to:', location.pathname);
      }
    }
  }, [isAuthenticated, isLoading, location.pathname, requireAuth]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // CRITICAL SECURITY: If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Show login modal and prevent access to protected content
    return (
      <>
        <LoginModal 
          open={true} 
          onOpenChange={(open) => {
            if (!open) {
              // If user closes modal without logging in, redirect to home
              console.warn('[ProtectedRoute] User closed login modal - redirecting to home');
              window.location.href = '/';
            }
          }}
          onSuccess={() => {
            // After successful login, user will be authenticated and can access the route
            console.log('[ProtectedRoute] Login successful - access granted');
            setShowLoginModal(false);
          }}
        />
        {/* Show a message while login modal is open */}
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center p-6">
            <h2 className="text-2xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              Please log in to access this page.
            </p>
            <p className="text-sm text-muted-foreground">
              Cart and checkout require authentication for security.
            </p>
          </div>
        </div>
      </>
    );
  }

  // User is authenticated, allow access
  return children;
}

