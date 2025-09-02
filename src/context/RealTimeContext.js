import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import socketService from '../services/socketService';
import { Context as AuthContext } from './AuthContext';

/**
 * Real-time Context for managing live updates
 *
 * This context provides:
 * - Real-time data updates from server
 * - Connection status
 * - Automatic data refresh when updates are received
 * - User activity tracking
 */

const RealTimeContext = createContext();

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

export const RealTimeProvider = ({ children }) => {
  const {
    state: { user },
  } = useContext(AuthContext);

  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    userId: null,
    reconnectAttempts: 0,
  });

  const [lastUpdate, setLastUpdate] = useState(null);
  const [updateHistory, setUpdateHistory] = useState([]);

  // Use ref to track the last processed update timestamp to prevent duplicates
  const lastProcessedTimestamp = useRef(null);

  /**
   * Initialize socket connection and setup listeners
   */
  useEffect(() => {
    console.log('🔄 RealTimeContext: Initializing socket connection...');
    // Connect to Socket.io server
    socketService.connect();

    // Setup event listeners
    const handleDataUpdate = data => {
      console.log('🔄 Real-time update received:', data);
      console.log('🔄 Previous lastUpdate:', lastUpdate);
      console.log(
        '🔄 Last processed timestamp:',
        lastProcessedTimestamp.current
      );
      console.log('🔄 New update timestamp:', data.timestamp);

      // Check if this is a duplicate update (same timestamp)
      if (lastProcessedTimestamp.current === data.timestamp) {
        console.log('🔄 Duplicate update detected, ignoring...');
        return;
      }

      // Check if this is an older update (shouldn't happen but just in case)
      if (
        lastProcessedTimestamp.current &&
        data.timestamp < lastProcessedTimestamp.current
      ) {
        console.log('🔄 Older update detected, ignoring...');
        return;
      }

      // This is a new update, process it
      lastProcessedTimestamp.current = data.timestamp;
      setLastUpdate(data);
      setUpdateHistory(prev => [...prev.slice(-9), data]); // Keep last 10 updates
      console.log('🔄 Update processed successfully');
    };

    const handleNotification = data => {
      console.log('📢 Notification received:', data);
      // You can add notification handling here (toast, alert, etc.)
    };

    // Add listeners
    socketService.addEventListener('data-updated', handleDataUpdate);
    socketService.addEventListener('notification', handleNotification);

    // Update connection status periodically
    const statusInterval = setInterval(() => {
      setConnectionStatus(socketService.getConnectionStatus());
    }, 1000);

    // Cleanup on unmount
    return () => {
      socketService.removeEventListener('data-updated', handleDataUpdate);
      socketService.removeEventListener('notification', handleNotification);
      clearInterval(statusInterval);
      socketService.disconnect();
    };
  }, []);

  /**
   * Automatically set up real-time connection when user is authenticated
   */
  useEffect(() => {
    if (user && user.id) {
      console.log(
        '🔄 RealTimeContext: User authenticated, setting up real-time connection for user:',
        user.id
      );

      // Authenticate user with real-time service
      socketService.authenticate(user.id);
      setConnectionStatus(prev => ({ ...prev, userId: user.id }));

      // Send user activity
      socketService.sendUserActivity(user.id);

      console.log(
        '🔄 RealTimeContext: Real-time connection established for user:',
        user.id
      );
    } else if (user === null) {
      console.log(
        '🔄 RealTimeContext: User logged out, clearing real-time connection'
      );
      setConnectionStatus(prev => ({ ...prev, userId: null }));
    }
  }, [user]);

  /**
   * Authenticate user with real-time service
   */
  const authenticateUser = useCallback(userId => {
    socketService.authenticate(userId);
    setConnectionStatus(prev => ({ ...prev, userId }));
  }, []);

  /**
   * Send user activity
   */
  const sendUserActivity = useCallback(userId => {
    socketService.sendUserActivity(userId);
  }, []);

  /**
   * Get update history for specific data type
   */
  const getUpdatesForDataType = useCallback(
    dataType => {
      return updateHistory.filter(update => update.dataType === dataType);
    },
    [updateHistory]
  );

  /**
   * Check if there are recent updates for a specific data type
   */
  const hasRecentUpdate = useCallback(
    (dataType, withinMinutes = 5) => {
      const recentUpdates = updateHistory.filter(update => {
        if (update.dataType !== dataType) return false;

        const updateTime = update.timestamp;
        const fiveMinutesAgo = Date.now() - withinMinutes * 60 * 1000;

        return updateTime > fiveMinutesAgo;
      });

      return recentUpdates.length > 0;
    },
    [updateHistory]
  );

  /**
   * Clear update history
   */
  const clearUpdateHistory = useCallback(() => {
    setUpdateHistory([]);
  }, []);

  const value = {
    // Connection status
    connectionStatus,
    isConnected: connectionStatus.isConnected,
    userId: connectionStatus.userId,
    reconnectAttempts: connectionStatus.reconnectAttempts,

    // Update data
    lastUpdate,
    updateHistory,
    getUpdatesForDataType,
    hasRecentUpdate,
    clearUpdateHistory,

    // Actions
    authenticateUser,
    sendUserActivity,
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};
