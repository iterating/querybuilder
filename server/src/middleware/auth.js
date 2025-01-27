import { supabase } from '../lib/supabase.js';
import { logger } from '../utils/logger.js';

const REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds

const isTokenExpiringSoon = (session) => {
  if (!session?.expires_at) return false;
  const expiresAt = session.expires_at;
  const now = Math.floor(Date.now() / 1000); // Convert to seconds
  return (expiresAt - now) < REFRESH_THRESHOLD;
};

const refreshToken = async (refreshToken) => {
  try {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Failed to refresh token:', error);
    throw error;
  }
};

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Get current session and user
    const { data: { session, user }, error: getUserError } = await supabase.auth.getSession();

    if (getUserError || !session) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if token needs refresh
    if (isTokenExpiringSoon(session)) {
      logger.info('Token expiring soon, refreshing...');
      try {
        const { session: newSession } = await refreshToken(session.refresh_token);
        // Set the new token in response headers
        res.set('X-New-Token', newSession.access_token);
        res.set('X-New-Refresh-Token', newSession.refresh_token);
        // Update user and session with refreshed data
        user = newSession.user;
      } catch (refreshError) {
        logger.error('Token refresh failed:', refreshError);
        // Continue with current token if refresh fails
      }
    }

    // Attach user to request
    req.user = user;
    req.session = session;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};
