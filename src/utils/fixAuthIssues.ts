/**
 * Helper functions to fix authentication issues
 * These functions are used to complement the authentication system
 */

import { isDevToken, DEV_TOKEN } from './devMode';

/**
 * Safe check for token expiration that handles development mode and edge cases
 * @param tokenToCheck The token to check
 * @returns boolean true if the token is valid and not expired
 */
export const safeTokenCheck = (tokenToCheck: string | null): boolean => {
  // Handle null/empty token
  if (!tokenToCheck) {
    return false;
  }
  
  // Always valid in dev mode with dev token
  if (isDevToken(tokenToCheck) && process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // For real tokens, they need proper JWT validation
  // This is handled by the isTokenExpired function elsewhere
  return true;
};

/**
 * Reset development authentication session flags
 * This helps when authentication gets stuck in development mode
 */
export const resetDevAuth = (): void => {
  // Only perform this in development mode
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  console.log('Resetting development authentication state');
  
  // Clear session storage flags used by dev auth
  sessionStorage.removeItem('devLoginAttempted');
  sessionStorage.removeItem('devAuthInitialized');
  
  // Only remove the token if it's a dev token
  const token = localStorage.getItem('token');
  if (token && token === DEV_TOKEN) {
    localStorage.removeItem('token');
  }
  
  // Force page reload to start fresh
  console.log('[DEBUG][HardRedirect][fixAuthIssues] Redirecting to /login?noautologin=true');
  window.location.href = '/login?noautologin=true';
};

/**
 * Fix stale authentication sessions
 * This addresses the session management issues
 */
export const fixSessionState = (): void => {
  // Clear out any auth error messages in session storage
  // that might be left over from previous errors
  sessionStorage.removeItem('authError');
  
  // Reset API health check cache to force re-checking
  sessionStorage.removeItem('apiHealthChecked');
  
  // Reset auth check timestamps to force fresh checks
  sessionStorage.removeItem('lastAuthCheck');
  sessionStorage.removeItem('lastAdminCheck');
  
  // Reset cache states
  sessionStorage.removeItem('auth_cache');
  sessionStorage.removeItem('user_cache');
  sessionStorage.removeItem('admin_check');
};

/**
 * Fix development mode admin authentication
 * This function helps when you need to force admin access in development mode
 * 
 * @param reload Whether to reload the page after applying changes
 */
export const forceDevModeAdmin = (reload: boolean = false): void => {
  // Only perform this in development mode
  if (process.env.NODE_ENV !== 'development') {
    console.log('This function only works in development mode');
    return;
  }
  
  console.log('Forcing development mode admin authentication...');
  
  // Set the dev token
  localStorage.setItem('token', DEV_TOKEN);
  
  // Set up all required session storage items for admin access
  const now = Date.now();
  const expiryTime = now + (60 * 60 * 1000); // 60 minutes (extended from 30)
  
  // Create cache objects
  const cacheItem = {
    value: true,
    expires: expiryTime
  };
  
  const userCacheItem = {
    value: {
      user_id: 1,
      email: 'dev@example.com',
      first_name: 'Development',
      last_name: 'User',
      role: 'Admin', // Always set to Admin for dev mode
      is_active: true,
      isVerifiedAdmin: true // Explicitly mark as verified admin
    },
    expires: expiryTime
  };
  
  // Clear any existing session data that might conflict
  sessionStorage.removeItem('auth_cache');
  sessionStorage.removeItem('admin_check');
  sessionStorage.removeItem('user_cache');
  
  // Store in session storage with fresh values
  sessionStorage.setItem('auth_cache', JSON.stringify(cacheItem));
  sessionStorage.setItem('admin_check', JSON.stringify(cacheItem));
  sessionStorage.setItem('user_cache', JSON.stringify(userCacheItem));
  sessionStorage.setItem('lastAuthCheck', now.toString());
  sessionStorage.setItem('lastAdminCheck', now.toString());
  
  // Mark dev mode as initialized
  sessionStorage.setItem('devAuthInitialized', 'true');
  
  console.log('Development mode admin authentication forced successfully');
  console.log('You should now have admin access to all features');
  
  // Optionally reload the page to apply changes immediately
  if (reload) {
    console.log('Reloading page to apply changes...');
    setTimeout(() => window.location.reload(), 100);
  }
};
